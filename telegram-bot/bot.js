'use strict'

require('dotenv').config()
const { Telegraf, Markup, Scenes, session } = require('telegraf')
const axios = require('axios')
const fs = require('fs')
const Web3 = require('web3')
const Units = require('ethereumjs-units')
const Mail = require('@sendgrid/mail')
const bip39 = require('bip39')

const noteUser = require('./utils/noteUser').noteUser
const userRegister = require('./Scenes/userRegister').userRegister
const userVerification = require('./Scenes/userVerification').userVerification
const emailFriends = require('./Scenes/emailFriends')
const sendEbooks = require('./Scenes/sendEbooks')
const { gasLoad, gasBalance, gasExchange, gasPrice, gasIgniter } = require('./Scenes/gas')
const { treasuryBalance, treasuryDAOBalance } = require('./Scenes/treasury')
const dbCount = require('./utils/dbCount')
const createLink = require('./utils/createLink')
const { Redis } = require("@telegraf/session/redis")

const store = Redis({
	url: "redis://127.0.0.1:6379",
})

const mongoose = require('mongoose')
const User = require('./Schemas/User.js')

db()
  .then( () => console.log(`Mongo database connected`))
  .catch( err => console.log(`Mongo database not connected ${err}`) )

async function db() {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/fractalbook')
  } catch ( err ) {
    console.log('No mongodb', err)
  }
}

const telegramApiKey = process.env.TELEGRAM_APIKEY

const app = new Telegraf(telegramApiKey)
const stage = new Scenes.Stage(
  [ userRegister, 
    userVerification,
    gasBalance,
    gasLoad,
    gasPrice,
    gasExchange,
    gasIgniter,
    treasuryBalance,
    treasuryDAOBalance,
    emailFriends,
    sendEbooks
  ]
)

app.use( session({ store }) )
app.use( stage.middleware() )

app.telegram.setMyCommands(
  [
    {
      command     : '/inizio',
      description : 'Registrazione e verifica'
    },
    {
      command     : '/cofanetto',
      description : 'Caricare cripto / mostrare bilancio cripto'
    },
    {
      command     : '/compra_ebooks',
      description : 'Acquista libri da regalare ai tuoi amici'
    },
    {
      command     : '/tesoro_amici',
      description : 'La conoscenza è un tesoro ma ancora di più gli amici'
    },
    {
      command     : '/bilancio_tesoro',
      description : 'Bilancio del tesoro'
    },
    {
      command     : '/aiuto',
      description : 'Help Bot'
    },
  ]
)

// Start command

app.command('start', (ctx) => {
  let userFirstName = ctx.message.from.first_name
  ctx.reply(`Ciao ${ userFirstName }, Questo è l'/inizio di un viaggio per somergerti nella cultura e donare un tesoro ai tuoi amici.\n\n(Clicca /inizio)`)
})

app.command('inizio', async (ctx) => {
  let user, message, options
  try {
    user = await User.findOne({ telegramID: ctx.message.from.id })
  } catch (error){
    console.log(error)
  }
  let origin = ctx.update.message.chat.type == 'group' ? 'group' : 'private'
  if ( origin === 'private' ) {
    let userFirstName = ctx.message.from.first_name
    if ( user.verifiedEmail && user.verifiedPhone ) {
      message = `${ userFirstName }, hai già verificato il tuo email e il numero di telefono clicca il pulsante per vedere il tuo address e il tuo link.`
      options = Markup.inlineKeyboard([
       [ { text: 'Utente verificato', callback_data: 'user_verification'} ]
      ])
    } else {
      message = `${ userFirstName }, le prime due cose che devi fare sono registrarti e verificare il tuo cofanetto di libri.\nDopo potrai acquistare dei libri per regalare ai tuoi amici.`
      options = Markup.inlineKeyboard([
       [ { text: 'A) Registro utente', callback_data: 'user_register'} ],
       [ { text: 'B) Verifica utente', callback_data: 'user_verification'} ]
      ])
    }
    ctx.reply(message, options)
  } else {
    ctx.reply('Per completare il registro è consultare il chatbot in riservatezza clicca -> @fractalbook_bot')
  }
})

app.command('verificare', (ctx) => {
  let userFirstName = ctx.message.from.first_name
  let message = `${userFirstName}, verificheremo il tuo account utilizzando i codici a sei cifre che hai ricevuto via e-mail e SMS.`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Verifica dell\'utente', 'user_verification'),
  ])
  ctx.reply(message, options)
})

app.command('verifica', (ctx) => {
  let userFirstName = ctx.message.from.first_name
  let message = `${userFirstName}, verificheremo il tuo account utilizzando i codici a sei cifre che hai ricevuto via e-mail e SMS.`
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Verifica dell\'utente', 'user_verification'),
  ])
  ctx.reply(message, options)
})

app.command('cofanetto', (ctx) => {
  let message = `Ricarica il tuo cofanetto con cripto per cambiarli per il tuo primo libro.`
  let options = Markup.inlineKeyboard([
    [
      { text: 'Saldo Cripto',    callback_data: 'gas_balance'},
      { text: 'Ricarica Cripto', callback_data: 'gas_load'},
    ],
    [
      { text: 'Cripto Prezzo del ebook',  callback_data: 'gas_price'}
    ]
  ])
  ctx.reply(message, options)
})

app.command('tesoro_amici', async ctx => {
  let user, message
  let payload = [
    [
      { text: 'Aggiunge l\'email di cinque amici', callback_data: 'add_email_friends'},
    ],
    [
      { text: 'Spedici il libro ai tuoi cinque migliori amici', callback_data: 'send_ebooks'}
    ]
  ]
  try {
    user = await User.findOne({ telegramID : ctx.message.from.id })
  } catch ( error ) {
    console.log(error)
  }

  if (user.listXeBook.length === 5) {
    payload.shift()
    message = `${ user.name }, spedisci ai tuoi amici i libri del tuo tesoro.`
  } else {
    payload.pop()
    message = `${ user.name }, aggiunge l'email degli amici a chi mandare il tesoro.`
  }

  let options = Markup.inlineKeyboard(payload)
  ctx.reply(message, options)
})

app.command('/do_again_tesoro_amici', async ctx => {
  let user, message
  await ctx.reply('Cancellando vecchia lista di emails')
  let payload = [
    [
      { text: 'Aggiungi l\'email di cinque amici', callback_data: 'add_email_friends'},
    ]
  ]
  try {
    user = await User.findOne({ telegramID : ctx.message.from.id })
    user.listXeBook = [] 
    await user.save()
  } catch ( error ) {
    console.log(error)
  }

  message = `${ user.name }, aggiungi l'email degli amici a chi mandare il tesoro.`

  let options = Markup.inlineKeyboard(payload)
  ctx.reply(message, options)
})

app.command('check_email_friends',  async ctx  => {
  let user
  try {
    user = await User.findOne({ telegramID: ctx.message.from.id })
  } catch (error) {
    console.log(error)
  }
  if(user.listXeBook && user.listXeBook.length === 5 ) {
    await ctx.reply(
      `${user.name}, Il tuo elenco di email di amici è
      1) ${user.listXeBook[0]}
      2) ${user.listXeBook[1]}
      3) ${user.listXeBook[2]}
      4) ${user.listXeBook[3]}
      5) ${user.listXeBook[4]}
    `)
    ctx.reply("Se c'è qualche errore rifà il processo cliccando qui\n/do_again_tesoro_amici.\n\n" +
    "Se tutti gli email sono corretti clicca\n/tesoro_amici")
  } else {
    ctx.reply('Non hai una lista d\'email da amici. Clicca /tesoro_amici per crearla')
  }
})

app.command('compra_ebooks', (ctx) => {
  let userFirstName = ctx.message.from.first_name
  let message = `${userFirstName}, sei pronto per acquistare cultura? Ricorda, la cultura è ricchezza`
  let options = Markup.inlineKeyboard(
    [
      [{ text: 'Compra dei ebooks',  callback_data: 'gas_exchange' }],
      [{ text: 'Compra dei ebook con qr ',  callback_data: 'gas_igniter'}]
    ])
  ctx.reply(message, options)
})

app.command('ask_link', async ctx => {
  let user
  let fromId = ctx.message.from.id
  try {
    user = await User.findOne({ telegramID : fromId })
  } catch ( error ) {
    console.log(error)
  }
  if (user && user.refereeNumber < 5) {
    let newLink = await createLink(ctx, 'direct')
    if ( newLink != 'broken_link' ) {
      user.link = newLink.invite_link ? newLink.invite_link : newLink
      user.save()
      ctx.reply(`${user.username} has a new link ${user.link}`)
    }
  } else if (user && user.refereeNumber >= 5) {
    ctx.reply(`${ user.username } has completed the number of referees`)
  } else {
    ctx.reply('A no registered user can\'t apply for a referrer link.')
  }
})

app.command('treasury_balance', async ctx => {
  let message = 'Check your Treasury total balance'
  let options = Markup.inlineKeyboard([
    Markup.button.callback('Personal Balance', 'treasury_personal_balance'),
    Markup.button.callback('DAO Balance', 'treasury_dao_balance'),
  ])
  ctx.reply(message, options)
})

app.command('treasury_dao_balance', async ctx => {
  // TODO: Exchange info
  let a = await exchangeInfo()
  console.log(a)
})

app.command('aiuto', async (ctx) => {
  console.log("Aiutooooo", ctx.update)
  let origin = ctx.update.message.chat.type == 'group' ? 'group' : 'private'
  if ( origin == 'group')  {
    ctx.reply('Per completare il registro è consultare il chatbot in riservatezza clicca -> @fractalbook_bot')
  }
  if ( origin == 'private')  {
    ctx.reply('Dopo completare registro e verifica puoi aquistare i libri che regalererai ai tuoi amici.')
  }
  try {
    dbCount(ctx)
  } catch(error) {
    console.log(error)
  }
})

// app.on('new_chat_participant', (ctx) => ctx.reply(`👍 Welcome ${ctx.from.first_name}t`))
app.on('chat_join_request', async (ctx) => {
  let user, link
  let referee = ctx.update.chat_join_request.from.id
  let referer = parseInt(ctx.update.chat_join_request.invite_link.name.split('-')[1])
  try {
    user = await User.findOne({ telegramID: referer })
    console.log("*****USER*****", user)
  } catch ( error ) {
    console.log(error)
  }
  // console.log('User:', user)
  if ( user.telegramID === referer ) {
    user.refereeNumber++
    if ( user.refereeNumber <= 5 ) {
      try {
        await ctx.approveChatJoinRequest(referee)
        await ctx.reply(`Benvenuto ${ ctx.update.chat_join_request.from.first_name } questo è il gruppo di prova del fractalbook.\nQuando sei pronto vai al bot @fractalbook_bot per completare il registro.`)
      } catch(e) {
        console.log("ERROR", e)
      }
      try {
        link = await noteUser(ctx, 'indirect')
        if ( link ) user.save()
      } catch ( err ) {
        console.log("Link", err )
      }
    } else {
      // TODO: Don't send message to group but to administrator. 
      ctx.reply(`Il link d'invito che ti ha invitato il tuo amico ${ user.username } non è più valido. Chiede a lui un\'altro link.`)
    }
  }
})

// User Actions
app.action('treasury_personal_balance', Scenes.Stage.enter('treasuryBalance'))
app.action('user_register',        Scenes.Stage.enter('userRegister'))
app.action('user_verification',    Scenes.Stage.enter('userVerification'))
app.action('token_creation',       Scenes.Stage.enter('tokenCreation'))
app.action('token_tree_creation',  Scenes.Stage.enter('tokenTreeCreation'))
app.action('gas_balance',          Scenes.Stage.enter('gasBalance'))
app.action('gas_load',             Scenes.Stage.enter('gasLoad'))
app.action('gas_exchange',         Scenes.Stage.enter('gasExchange'))
app.action('gas_price',            Scenes.Stage.enter('gasPrice'))
app.action('gas_igniter',          Scenes.Stage.enter('gasIgniter'))
app.action('treasury_dao_balance', Scenes.Stage.enter('treasuryDAOBalance'))
app.action('add_email_friends',    Scenes.Stage.enter('emailFriends'))
app.action('send_ebooks',          Scenes.Stage.enter('sendEbooks'))

app.startPolling()
