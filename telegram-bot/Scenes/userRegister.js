const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const sendRegistration = require('../utils/sendVerifications.js').sendRegistration
const randomCode = require('../utils/randomCode.js')
const newUser = new User()
let oldUserRegistered, referer, user

const reEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const rePhone = /[0-9]/

const step1 = async (ctx) => {
  let email, userId, anyUser
  if ( ctx.update.callback_query ) userId = ctx.update.callback_query.from.id
  if ( ctx.update.message )        userId = ctx.update.message.from.id
  try{
    oldUserRegistered = await User.findOne({ telegramID: userId })
  } catch ( err ) {
    console.log(err)
  }
  if ( !oldUserRegistered ) {
    try {
      anyUser = await User.find({})
    } catch (error) {
      console.log(error)
    }
    if (anyUser.length > 0) {
      ctx.replyWithHTML(`<b>Spiacente ${ctx.update.callback_query.from.first_name}, Per registrarti devi avvere un link d'invito.</b>`)
      return ctx.scene.leave()
    } else {
      await ctx.replyWithHTML(`<b>Benvenuto ${ ctx.update.callback_query.from.first_name }!! Come primo utente diventerai l\'admin di questa DAO.</b>`)
    }
  } 
  if ( oldUserRegistered ) email = oldUserRegistered.email.split('@')[1]
  if ( oldUserRegistered && oldUserRegistered.telegramID && !oldUserRegistered.verifiedEmail && !oldUserRegistered.verifiedPhone ) {
    try {
      referer = await User.findOne({ telegramID: oldUserRegistered.referer })
    } catch (error) {
      console.log("Error from db register", error)
      return ctx.scene.leave()
    }
  }

  if ( oldUserRegistered && email == 'tempo.ral' ) {
    if ( !oldUserRegistered.referer ) {
      await ctx.replyWithHTML(`Stai iniziando un fractal senza referenti.\n Mettiti in contatto con el developer di chocosfera s.r.l per controllare il registro sul db.`)
    } else {
      await ctx.replyWithHTML(`Stai iniziando una registrazione patrocinata da ${ referer.name || referer.username }.\nSe questo non è corretto per favore mettiti in contatto con l'amministratore della DAO.`)
      ctx.replyWithHTML('Per creare un nuovo utente c\'è bisogno della tua email e del tuo numero di telefono.\n<b>Per prima cosa scrivi la tua email.</b>')
      return ctx.wizard.next()
    }
  } else if ( oldUserRegistered && oldUserRegistered.verifiedEmail && oldUserRegistered.verifiedPhone ) {
    ctx.reply(`${ oldUserRegistered.verifiedPhone && oldUserRegistered.verifiedEmail ? 'Sei già registrato. Ora devi eseguire la /verifica' : 'Sei registrato e verificato.' }`)
    return ctx.scene.leave()
  } else {
    ctx.replyWithHTML('Per creare un nuovo utente c\'è bisogno della tua email e del tuo numero di telefono.\n<u><i>Continuando dai il consenso per ricevere email e sms da parte nostra.</i></u>\n<b>Per prima cosa scrivi la tua email</b>.')
    return ctx.wizard.next()
  }
}

const step2 = new Composer()

step2.command('cancel', (ctx) => {
  ctx.reply('Bye bye e-Mail')
  return ctx.scene.leave()
})

step2.on('message', async (ctx) => {
  if ( !oldUserRegistered && reEmail.test(ctx.message.text) ) {
    newUser.email = ctx.message.text
    if (ctx.update.message.from.username) newUser.username = ctx.update.message.from.username
    newUser.telegramID = ctx.update.message.from.id
    newUser.emailCode = randomCode()
    ctx.reply(`Ho ricevuto la tua email ${ ctx.message.text }\nOra scrivi il tuo numero di telefono`)
    return ctx.wizard.next()
  } 
  if ( oldUserRegistered && reEmail.test(ctx.message.text) ) {
    oldUserRegistered.email = ctx.message.text
    oldUserRegistered.emailCode = await randomCode()
  } else {
    ctx.reply(`Spiacente, non posso accettare ${ ctx.message.text } come email. Riprova dopo aver scritto correttamente.`)
    return ctx.wizard.selectStep(0)
  }
  ctx.reply(`Ho ricevuto la tua email ${ ctx.message.text }\nOra scrivi il tuo numero di telefono`)
  return ctx.wizard.next()
})

const step3 = new Composer()

step3.command('cancel', (ctx) => {
  ctx.reply('Bye bye Phone')
  return ctx.scene.leave()
})

step3.on('message', async (ctx) => {
  if ( newUser.email && rePhone.test(ctx.message.text) ) {
    newUser.phone = ctx.message.text
    newUser.phoneCode = randomCode()
  } else if ( oldUserRegistered.email && rePhone.test(ctx.message.text) ) {
    oldUserRegistered.phone = ctx.message.text
    oldUserRegistered.phoneCode = randomCode()
  } else {
    ctx.reply('Mi dispiace non posso accettare che un numero di telefono. Riprova dopo aver scritto correttamente.')
    return ctx.wizard.selectStep(1)
  }
  try {
    user = await User.findOne({ telegramID: ctx.message.from.id })
  } catch (error) {
    console.log("From register", error)
  }
  if ( !user && !oldUserRegistered ) {
    ctx.reply(`Ho ricevuto il tuo telefono ${ctx.message.text}\nDopo aver ricevuto i codici di verifica tramite SMS ed e-mail, devi inserirli facendo clic su /verificare.`)
    newUser.phone = ctx.message.text
    newUser.phoneCode = randomCode()
    let _userName = newUser.name ? newUser.name : newUser.username
    newUser.sinceMessageID = ctx.update.message.from.id
    // TODO: Use a template to send email registration.
    sendRegistration(_userName, newUser.email, newUser.phone, newUser.phoneCode, newUser.emailCode)
    newUser.save()
    return ctx.scene.leave()
  } else {
    oldUserRegistered.phoneCode = randomCode()
    oldUserRegistered.save()
    sendRegistration( oldUserRegistered.name, oldUserRegistered.email, oldUserRegistered.phoneCode, oldUserRegistered.emailCode)
    ctx.reply(`Ho ricevuto il tuo telefono ${ctx.message.text}\nDopo aver ricevuto i codici di verifica tramite SMS ed e-mail, devi inserirli facendo clic su /verificare.`)
    return ctx.scene.leave()
  }
});

const userRegister = new Scenes.WizardScene('userRegister',
  (ctx) => step1(ctx), step2, step3
)

module.exports = { userRegister }