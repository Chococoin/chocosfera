const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const QRCode = require('qrcode')
const imageDataURI = require('image-data-uri')
const exchangeCreateOrder = require('../utils/exchange').exchangeCreateOrder
const exchangeInfo = require('../utils/exchange').exchangeInfo

require('dotenv').config()

const { Contract, web3 } = require('../utils/web4u.js')
const fs = require('fs')

const _symbol = process.env.KRAKEN_PAIR
const _network = process.env.NETWORK
let _provider, _contractAddress, _lastNetwork
let InfuraUrl = `https://polygon-mumbai.infura.io/v3/${ process.env.INFURA_APIKEY }`

/*=================================UTILS===================================*/

async function initializedIt( UserPrvKey ){
  let HDWalletProvider = require('@truffle/hdwallet-provider')
  let abi = require('../build/contracts/Treasury.json').abi
  const netWorks = require('../build/contracts/Treasury.json').networks
  let _Web3 = require('web3')
  let prvKey
  if ( UserPrvKey ) {
    prvKey = UserPrvKey
  } else {
    prvKey = process.env.MNEMONIC 
  }
  if ( _network === 'development' ) {
    _lastNetwork = Object.keys(netWorks)[Object.keys(netWorks).length-1]
    _contractAddress = require('../build/contracts/Treasury.json').networks[_lastNetwork].address
    _provider = new HDWalletProvider(prvKey, 'http://localhost:8545')
  } else {
    _contractAddress = require('../build/contracts/Treasury.json').networks[_network].address
    console.log("****CONTRACT ADDRESS INIT****", _contractAddress)
    _provider = new HDWalletProvider(prvKey, InfuraUrl)
  }

  let _web3 = new _Web3(_provider)
  let _sender = _provider.addresses[0]
  let _contract = new _web3.eth.Contract(abi, _contractAddress, { from: _sender })
  return { _web3 , _contract, _sender }
}

/*==========================CLOSE UTILS===================================*/
// sendOutsourcing(rawBalance, user.address, user.passphrase[0])
async function sendOutsourcing ( balance, address ) {
  const { _web3, _contract, _sender } = await initializedIt(address)
  let priceTx = await _contract.methods.outSourcing().estimateGas({ from: _sender, value: balance })
  let _gasPrice = await _web3.eth.getGasPrice()
  let amount = (balance - ( priceTx * _gasPrice * 1.75 ))
  try {
    let tx = await _contract.methods.outSourcing().send({ from: _sender, value: amount })
    console.log(tx)
    return amount
  } catch ( err ) {
    console.log(err)
  }
}

async function setBestPrice(data) {
  let req
  let firstBid  =  data.book.bids[0][0]
  let firstAsks =  data.book.asks[0][0]
  let secondBid =  data.book.bids[1][0]
  let thirdBid  =  data.book.bids[2][0]
  let avgBidPrice = (firstBid + secondBid + thirdBid) / 3
  let bestPrice = (avgBidPrice + avgBidPrice * 0.020).toFixed(5) * 10**18
  firstAsks = firstAsks.toFixed(5) * 10**18
  console.log("You must set best price!", bestPrice, firstAsks, firstBid)
  firstAsks = firstAsks.toString()
  console.log("First Asks type!", typeof firstAsks)
  console.log("First Asks!", firstAsks)
  // let userEuroVolume =  avgBidPrice * amount
  // let avgVolume = (firstBidWall + secondBidWall + thirdBidWall) / 3
  if( bestPrice < firstAsks ) {
    const { _contract, _sender } = await initializedIt()
    try{
      req = await _contract.methods.setTreasuryEuroPrice(firstAsks).send({ from: _sender })
      console.log("From setBestPrice", req)
    } catch ( error ) {
      console.log("Error setting treasury price", error)
    }
  } else {
    console.log("Ufaaa!")
  }
  return bestPrice
}

async function setPrice(data) {
  let req
  let firstBid  =  data.book.asks[0][0]
  console.log("Exchange price bid:\n", firstBid)
  // **** How much crypto to pay for €1 treasury ****
  let treasuryEuroPrice = 1.003 / firstBid * 10**18
  let cryptoBookPrice = treasuryEuroPrice + treasuryEuroPrice * 0.22
  treasuryEuroPrice = treasuryEuroPrice.toString()
  const { _contract, _sender } = await initializedIt()
  try{
    req = await _contract.methods.setTreasuryEuroPrice(treasuryEuroPrice).send({ from: _sender })
  } catch(error) {
    console.log("Error setting treasury price", error)
  }
  // **** Return eBook price + IVA in crypto
  return (cryptoBookPrice / 10**18).toFixed(5)
}

/*  ===== GASBALANCE ===== */

/* Implement balance gas. */ 
const gasBalance1 = async (ctx) => {
  let user, userId, _gasBalance
  if ( ctx.update.callback_query ) userId = ctx.update.callback_query.from.id
  if ( ctx.update.message ) userId = ctx.update.message.from.id
  try {
    user = await User.findOne({ telegramID: userId })
  } catch (error) {
    console.log(error)
    ctx.reply('Utente non registrato. Fare click su /avvia per registrarti.')
    return ctx.scene.leave()
  }

  if ( !user || !user.verifiedEmail ) {
    ctx.reply('Utente non registrato. Fare click su /avvia per registrarti.')
    return ctx.scene.leave()
  } else {
    try {
      _gasBalance = await web3.eth.getBalance(user.address) / 10**18
    } catch ( error ) {
      console.log(error)
      ctx.reply(`Error: ${error}`)
    }
  }

  if ( _gasBalance >= 0.000001 ) {
    ctx.reply(`${ user.name || 'Caro cliente' }, hai ${ _gasBalance.toFixed(5) } come saldo di cripto nel tuo conto`)
  } else if (_gasBalance === 0){
    ctx.reply(`${ user.name || 'Caro cliente' }, non hai nulla di saldo cripto nel tuo account`)
  } else {
    ctx.reply(`${ user.name || 'Caro cliente' }, hai solo polvere come saldo di cripto nel tuo conto`)
  }
  return ctx.scene.leave()
}

const gasBalance = new Scenes.WizardScene('gasBalance',
  (ctx) => gasBalance1(ctx)
)

/**  ===== GASLOAD ===== */
const gasLoad1 = async (ctx) => {
  let _gasBalance, qr, user, qrText, img

  if ( ctx.update.callback_query.from ) {
    user = ctx.update.callback_query.from.id
  } else {
    console.log(ctx.update.callback_query)
  }

  user = await User.findOne({ telegramID: user })

  if ( user && user.verifiedPhone && user.verifiedEmail ) {
    try {
      _gasBalance = await web3.eth.getBalance(user.address) / 10**18
    } catch ( error ) {
      console.log(error)
      ctx.reply(`Error: ${ error }`)
      return ctx.scene.leave()
    }
    QRCode.toDataURL(`${ user.address }`, { errorCorrectionLevel: 'H' }, async function (err, url) {
      if ( err ) {
        ctx.reply('')
        console.log("Trouble with QRcode.")
      } else {
        img = await imageDataURI.outputFile(url, `decoded-image-${user.telegramID}.png`)
        qr = await ctx.replyWithPhoto({ source: fs.createReadStream(img) })
        qrText = await ctx.reply(`Carica il tuo cofanetto con criptovalute utilizzando Metamask.\nAttualmente il tuo saldo è ${ _gasBalance.toFixed(5) }.\nIn attesa ricarica /cancellare per interrompere il processo.`)
      }
    })
  }

  let secs = 0
  // DONE: Start payment listener! 
  let interval = setInterval( async () => {
    if ( secs >= 120 ) {
      clearInterval(interval)
      ctx.reply('Hai 2 minuti per effettuare il deposito.\nRiprova.')
      ctx.telegram.deleteMessage(ctx.chat.id, qr.message_id)
      ctx.telegram.deleteMessage(ctx.chat.id, qrText.message_id)
      fs.unlink( img, (err) => {
        if ( err ) {
            throw err
        }
      })
    }
    let newGasBalance  = await web3.eth.getBalance(user.address) / 10**18
    if ( newGasBalance > _gasBalance ) {
      ctx.telegram.deleteMessage(ctx.chat.id, qr.message_id)
      ctx.telegram.deleteMessage(ctx.chat.id, qrText.message_id)
      ctx.reply(`Hai ricevuto ${ (newGasBalance - _gasBalance).toFixed(5) } di cripto.\nOra il tuo totale ${ newGasBalance } di cripto.\nOra puoi scambiare le tue cripto per libri.`)
      clearInterval(interval)
      return ctx.scene.leave()
    }
    secs++
  }, 1000)
  return ctx.wizard.next()
}

const gasLoad2 = new Composer()

gasLoad2.command('cancel', async (ctx) => {
  ctx.reply('Bye bye exchange!')
  return ctx.scene.leave()
})

const gasLoad = new Scenes.WizardScene('gasLoad',
  (ctx) => gasLoad1(ctx), gasLoad2,
)

/**  ===== GASIGNITER ===== */

const gasIgniter1 = async (ctx) => {
  let _gasBalance, qr, user
  user = ctx.update.callback_query.from.id
  user = await User.findOne({ telegramID: user })
  if ( user && user.verifiedPhone && user.verifiedEmail ) {
    try {
      _gasBalance = await web3.eth.getBalance(user.address) / 10**18
    } catch ( error ) {
      console.log(error)
      ctx.reply(`Error: ${ error }`)
      return ctx.scene.leave()
    }
    let data = await exchangeInfo(_symbol)
    euroCriptoPrice = await setPrice(data)
    QRCode.toDataURL(`${ user.address }`, { errorCorrectionLevel: 'H' }, async function (err, url) {
      if ( err ) {
        ctx.reply('Ho avvuto un problema generando il QRcode. Per favore referisce al amministratore il codice # 201')
        console.log("Trouble # 201 with QRcode.")
      } else {
        let img = await imageDataURI.outputFile(url, `decoded-image-${user.telegramID}.`)
        qr = await ctx.replyWithPhoto({ source: fs.createReadStream(img) })
        ctx.reply(`Acquista l'ebook ricaricando cripto con metamask ${ euroCriptoPrice }. \nIn attesa di ricarica per procedere a spedire il libro.\n/cancellare per interrompere il processo.`)
      }
    })
  } else {
    ctx.reply('Devi essere registrato e verificato per procedere')
    return ctx.scene.leave()
  }

  let secs = 0
  // DONE: Start payment listener! 
  let interval = setInterval( async () => {
    if ( secs >= 120 ) {
      clearInterval(interval)
      ctx.reply('Hai 2 minuti per effettuare il deposito.\nRiprova.')
      ctx.telegram.deleteMessage(ctx.chat.id, qr.message_id)
    }
    let newGasBalance  = await web3.eth.getBalance(user.address) / 10**18
    if ( newGasBalance > _gasBalance && euroCriptoPrice ) {
      ctx.telegram.deleteMessage(ctx.chat.id, qr.message_id)
      fs.unlink('/' + img, (err) => {
        if (err) {
            throw err
        }
        console.log("Delete File successfully.")
    })
      ctx.reply(`Hai ricevuto ${ (newGasBalance - _gasBalance).toFixed(5) } di cripto.\nOra il tuo totale ${ newGasBalance } di cripto.\nOra puoi scambiare le tue cripto per un libro.`)
      clearInterval(interval)
      return ctx.scene.leave()
    }
    secs++
  }, 1000)
  return ctx.wizard.next()
}

const gasIgniter2 = new Composer()

gasIgniter2.command('cancel', async (ctx) => {
  ctx.reply('Bye bye exchange!')
  return ctx.scene.leave()
})

const gasIgniter = new Scenes.WizardScene('gasIgniter',
  (ctx) => gasIgniter1(ctx), gasIgniter2,
)

/**  ===== GASEXCHANGE ===== */
let gasUserBalance, rawBalance, user, bestPrice
const gasExchange1 = async (ctx) => {
  if ( ctx.update.callback_query ) userId = ctx.update.callback_query.from.id
  if ( ctx.update.message ) userId = ctx.update.message.from.id
  let res = await ctx.reply("Attendi qualche secondo mentre organizzo il processo di compra e spedizione dei tuoi libri.")
  try {
    user = await User.findOne({ telegramID: userId })
  } catch ( err ) {
    console.log(err)
  }
  // TODO: Set price in SmartContract
  let data = await exchangeInfo(_symbol)
  gasPriceInSc = await Contract.treasuryCoinPrice().call()
  gasPriceInSc = gasPriceInSc / 10**18
  console.log("Price of Book in smarContract", gasPriceInSc)
  console.table([{ "Asks": [data.book.asks[0][0], data.book.asks[0][1]], "Bids": [data.book.bids[0][0], data.book.bids[0][1]]}, { "Asks": [data.book.asks[1][0], data.book.asks[1][1]], "Bids": [data.book.bids[1][0], data.book.bids[1][1]]} ])
  let currentExchangePrice = data.book.asks[0][0]
  let currentExchangeVolume = currentExchangePrice * data.book.asks[0][1]
  try {
    gasUserBalance = await web3.eth.getBalance(user.address)
    gasUserBalance = rawBalance / 10**18
    console.log("Line 288", gasUserBalance)
  } catch ( err ) {
    console.log(err)
    return ctx.scene.leave()
  }
  let userVolumeEuroReq = (gasUserBalance * currentExchangePrice).toFixed(5) / 1
  // Checks and corrects if price in Smartcontract is different than exchange
  console.table([{"Exchange Current Price": currentExchangePrice, 
                  "Current Price in Sc": gasPriceInSc,
                  "Exchange Volume €": currentExchangeVolume,
                  "User Volume € Request": userVolumeEuroReq }])
  if ( currentExchangePrice != gasPriceInSc && currentExchangeVolume > userVolumeEuroReq ) {
    console.log("Setting new gas price in smart contract.")
    try {
      bestPrice = await setBestPrice(data)
    } catch(err) {
      console.log("Error with Smart Contract setPrice.")
    }
    console.log("Set best price!!!!", bestPrice)
  } else {
    //If there not enough volume in the first offer of the ledger book
    ctx.reply("Non se può continuare con il processo.")
  }

  try {
    await ctx.telegram.deleteMessage(ctx.chat.id, res.message_id)
  } catch ( err ) {
    console.log("Problem deleting message")
  }

  console.log( gasUserBalance * data.book.asks[0][0] )
  console.table( [{ "User gas Balance" : gasUserBalance, "Asks" : data.book.asks[0][0], "Euro to convert" : gasUserBalance * data.book.asks[0][0] }])
  if(gasUserBalance * data.book.asks[0][0] >= 1) {
    ctx.reply(`${ user.username }, Do you have ${ gasUserBalance.toFixed(5)} of gas to exchange for treasury.\n
    Right now the gas price is €${ currentExchangePrice } at kraken.\n
    You would receive ${ (gasUserBalance * currentExchangePrice).toFixed(5) } of Treasury.\n
    Do you want to exchange?\n
    /yes   or   /no            /cancel`)
  } else {
    ctx.reply("Non hai bilancio in cripto per avvere un libro.")
    return ctx.scene.leave()
  }
  return ctx.wizard.next()
}

const gasExchange2 = new Composer()

gasExchange2.command('yes', async (ctx) => {
  let res = await ctx.reply('Exchanging gas for treasury')
  let amount, data
  let treasuryUserBalance = await Contract.treasuryBalanceOf(user.address).call()
  treasuryUserBalance = web3.utils.fromWei(treasuryUserBalance) / 1
  let gasUserBalance = await web3.eth.getBalance(user.address)
  console.table([{"User Gas Balance": gasUserBalance , "Treasury Balance": treasuryUserBalance}])
  if ( gasUserBalance > 0 ) {
    try {
      amount = await sendOutsourcing(rawBalance, user.passphrase[0])
      console.log("From outSourcing", amount)
      data = await exchangeCreateOrder(amount, bestPrice, user.telegramID)
      // if(treasuryUserBalance > 0) {
      //   treasuryUserBalance = await web3.utils.fromWei(treasuryUserBalance) / 1
      // } else {
      //   treasuryUserBalance = 0
      // }
    } catch ( error ) {
      console.log(error)
      return ctx.scene.leave()
    }
  } else {
    ctx.reply("New feature coming soon.")
    return ctx.scene.leave()
  }
  ctx.telegram.deleteMessage(ctx.chat.id, res.message_id)
  treasuryUserBalance = await Contract.treasuryBalanceOf(user.address).call()
  treasuryUserBalance = web3.utils.fromWei(treasuryUserBalance) / 1
  ctx.reply(`You have exchanged your gas for Treasury Point.\n\
    Right now you have ${ treasuryUserBalance.toFixed(4) } of treasury Balance `)
  return ctx.scene.leave()
})

gasExchange2.command('no', async (ctx) => {
  // TODO: Give address to load with Polygon coins.
  // ctx.reply(`You have a balance of gas ${ balance }`)
  ctx.reply(`You have a canceled the exchange gas process`)
  return ctx.scene.leave()
})

gasExchange2.command('cancel', (ctx) => {
  ctx.reply('Bye bye exchange!')
  return ctx.scene.leave()
})

const gasExchange = new Scenes.WizardScene('gasExchange',
  (ctx) => gasExchange1(ctx), gasExchange2,
)

/**  ===== GASPRICE ===== */

const gasPrice1 = async (ctx) => {
  let msg = await ctx.reply("Attendere qualche secondo per lo scambio dati con l'exchange")
  let data = await exchangeInfo( _symbol )
  let price = await setPrice(data)
  await gasBalance1(ctx)
  await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id)
  ctx.reply(`Cripto necesario per comprare i cinque libri ${ price * 5 }`)
  return ctx.scene.leave()
}

const gasPrice = new Scenes.WizardScene('gasPrice',
  (ctx) => gasPrice1(ctx)
)

module.exports = { gasBalance, gasExchange, gasLoad, gasPrice, gasIgniter }
