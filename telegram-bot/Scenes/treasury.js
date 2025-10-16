const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const { Contract, web3 } = require('../utils/web4u.js')
const exchangeInfo = require('../utils/exchange').exchangeInfo

let _symbol = process.env.KRAKEN_PAIR

const treasuryBalance1 = async (ctx) => {
  let user, balance, balanceGas, balanceEuro
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  } catch (error) {
    console.log(error)
    ctx.reply("Utente non registrato. Fare clic su /inizio per registrarsi..")
  }
  balance = await Contract.treasuryBalanceOf(user.address).call()
  balance = web3.utils.fromWei(balance)
  if(balance > 0) {
    ctx.reply(`You've ${ balance } of treasury balance.`)
  } else {
    ctx.reply(`You haven't treasury balance yet. `)
  }
  return ctx.scene.leave()
}

const treasuryBalance = new Scenes.WizardScene('treasuryBalance',
  (ctx) => treasuryBalance1(ctx)
)

const treasuryDAOBalance1 = async (ctx) => {
  let msg = await ctx.reply("Please wait few seconds until an exchange response.")
  let balanceTreasury, balanceTreasuryBN, balance
  try {
    balance = await exchangeInfo(_symbol)
    balanceTreasuryBN = await Contract.treasuryBalance().call()
    balanceEuro = balance.balance.EUR.total / 1
    balanceGas = balance.balance.MATIC.total / 1
    balanceTreasury = await web3.utils.fromWei(balanceTreasuryBN) / 1
    ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id)
  } catch (error) {
    console.log(error)
    ctx.reply("We're experiencing some difficulties with the exchange site.")
  }
  ctx.reply(`Balance in Treasury is €${ balanceTreasury.toFixed(2) } :\nEUR : ${ balanceEuro.toFixed(2) }\nGAS : ${ balanceGas.toFixed(2) }\nTotal: ${ balanceEuro.toFixed(2) * balanceGas.toFixed(2) }`)
  return ctx.scene.leave()
}

const treasuryDAOBalance = new Scenes.WizardScene('treasuryDAOBalance',
  (ctx) => treasuryDAOBalance1(ctx)
)

module.exports = { treasuryBalance, treasuryDAOBalance }