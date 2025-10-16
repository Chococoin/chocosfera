'use strict'
require('dotenv').config()
const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')

const { Telegraf } = require('telegraf')
const telegramApiKey = process.env.TELEGRAM_APIKEY
const app = new Telegraf(telegramApiKey)

let friendNum = (a) => {
  if (a[0] === 0) a.pop()
  let b = a.length
  console.log(`@@@${ b }@@@`)
  switch ( b ) {   
    case 0: return "primo"
    case 1: return "secondo"
    case 2: return "terzo"
    case 3: return "quarto"
    case 4: return "quinto"
    default: return "🐛"; 
  }
}

async function emailListChecker (ctx) {
  let bol = true
  let vEmail = ctx.message.text.trim()
  if ( reEmail.test(vEmail) ) {
    if ( emailList.length != 0 ) emailList.forEach( i => { if ( i === vEmail ) { bol = false }; console.log(bol); } )
  } else {
    ctx.reply(`${ctx.message.text} non è valido come email.`)
    return bol = 1
  }
  return bol
}

const reEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

let user
var emailList = []

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
    console.log("Step1", user.listXeBook)
  } catch (err) {
    return ctx.scene.leave()
  }
  if ( user.listXeBook.length === 5 ) {
    ctx.replyWithHTML(`${ user.name } hai già una lista di emails di amici\n
      1) ${ user.listXeBook[0] }
      2) ${ user.listXeBook[1] }
      3) ${ user.listXeBook[2] }
      4) ${ user.listXeBook[3] }
      5) ${ user.listXeBook[4] }
    `)
    return ctx.scene.leave()
  }
  let origin = ctx.update.callback_query.message.chat.type == 'group' ? 'group' : 'private'
  if ( origin === 'private' ) {
    if ( user && user.verifiedEmail && user.verifiedPhone ) {
      await ctx.replyWithHTML('Per Regalare un libro ai tuoi 5 migliore amici.\n' +
      '1) Realiza questo proceso unicamente quando saprai a chi mandare i tuoi 5 libri.\n' +
      '2) Carica il tuo coffaneto di libri con crypto\n' +
      '<b>3)</b> <i>Inserisci l\'email di ognuno di loro.</i>\n'  +
      '4) Spedici i libri ai tuoi amici e fai un tesoro.\n\n'
      )
      ctx.replyWithHTML(`<b>Inserici l\'email del tuo ${ friendNum(user.listXeBook) } amico.</b>`)
      return ctx.wizard.next()
    } else {
      ctx.reply("Devi essere registrato per creare la tua lista di amici.")
      return ctx.scene.leave()
    }
  } else {
    ctx.replyWithHTML(`Questa è una azione da realizzare in privato con il @fractalbook_bot`)
    return ctx.scene.leave()
  }
}

const step2 = new Composer()

step2.command('cancel', (ctx) => {
  ctx.reply('Arrivederci email to friends')
  return ctx.scene.leave()
})

step2.on('message', async ( ctx ) => {
  const currentStepIndex = ctx.wizard.cursor
  let resp = await emailListChecker(ctx)
  if ( resp && typeof resp === 'boolean' ) {
    emailList.push(ctx.message.text.trim())
    if ( emailList.length < 5 ) {
      return ctx.wizard.selectStep(currentStepIndex) && app.telegram.sendMessage(ctx.message.chat.id, `Inserici l\'email del tuo ${ friendNum(emailList) } amico.`)
    } else {
      ctx.reply(`Ho la lista dei tuoi cinque amici. Per controllare che siano stati inseriti bene clicca /check_email_friends`)
      user.listXeBook = emailList
      user.save()
      return ctx.scene.leave()
    }
  } else {
    if ( typeof resp != 'boolean' ) {
      app.telegram.sendMessage(ctx.message.chat.id, `Inserici l\'email del tuo ${ friendNum(emailList) } amico.`)
    } else {
      ctx.replyWithHTML(`${ctx.message.text} è gia stato inserito. <b>Riprova con uno nuovo</b>`)
    }
  }
})

const emailFriends = new Scenes.WizardScene('emailFriends',
  (ctx) => step1(ctx), step2
)

module.exports = emailFriends
