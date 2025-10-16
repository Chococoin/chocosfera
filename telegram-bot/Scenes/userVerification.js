const { Scenes, Composer } = require('telegraf')
const generateAddresses = require('../utils/generateAddresses.js')
const { sendVerifications } = require('../utils/sendVerifications.js')
const User = require('../Schemas/User.js')
let user

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.from.id })
  } catch ( err ) {
    logError(ctx, err)
  }
  if ( user ) {
    let userPhone = user.phone.toString().slice(0,3) 
    if ( !user.verifiedPhone && !user.verifiedEmail && userPhone === '555') {
      ctx.reply('Prima devi registrarti.')
      return ctx.wizard.next()
    }
    if ( !user.verifiedPhone && !user.verifiedEmail ) {
      ctx.reply('Verifichiamo il tuo account utilizzando il codice a 6 cifre che hai ricevuto via SMS ed e-mail.\nPer prima cosa inserisci il tuo codice SMS.')
      return ctx.wizard.next()
    }
    if ( user.verifiedPhone && !user.verifiedEmail ) {
      ctx.reply('Verifica la tua e-mail utilizzando il codice a 6 cifre che hai ricevuto via e-mail')
      return ctx.wizard.next()
    }
    if ( !user.verifiedPhone && user.verifiedEmail ) {
      ctx.reply('Verifica il tuo telefono utilizzando il codice a 6 cifre che hai ricevuto via sms')
      return ctx.wizard.next()
    }
    if ( user.verifiedPhone && user.verifiedEmail ) {
      if ( user.address === 'none' ) {
        user.address = generateAddresses(user.passphrase[0])
        await user.save()
      }
      ctx.reply(`Non c'è bisogno di inserire i codici. Utente già registrato.`)
      if ( user.address != 'none' ) await ctx.reply(`L'indirizzo per il cofanetto è\n${ user.address }`)
      if ( ctx.update.callback_query.message.chat.type === 'private' ) ctx.reply(`Il tuo link per invitare 5 amici è ${ user.link}`)
      return ctx.scene.leave()
    }
  } else {
    ctx.reply("Ricorda fare per prima cosa /register (Registro Utente).")
    return ctx.scene.leave()
  }

}

const step2 = new Composer()

step2.command('cancel', ( ctx ) => {
  ctx.reply('Processo di verifica della email annullato.')
  return ctx.scene.leave()
})

step2.on('message', async (ctx) => {

  const currentStepIndex = ctx.wizard.cursor

  try {
    user = await User.findOne({ telegramID: ctx.update.message.from.id })
  } catch ( err ) {
    ctx.reply('Ancora non registrato.')
    logError(ctx, err)
  }

  if ( user.verifiedEmail && user.verifiedPhone ) {
    ctx.reply('Utente già registrato.')
    return ctx.scene.leave()
  }

  if ( ctx.message.text == user.phoneCode ) {
    user.verifiedPhone = true
    await user.save()
    if ( user.verifiedEmail && user.verifiedPhone ) {
      ctx.reply('Telefono e e-mail confermati.')
      user.address = generateAddresses(user.passphrase[0])
      await user.save()
      ctx.reply(`Il indirizzo della tua biblioteca è ${ user.address }`)
      sendVerifications(user.email, user.phone, user.name)
      return ctx.scene.leave()
    } else {
      ctx.reply('Numero telefonico confermato. Ora inserisci il codice che hai ricevuto via email.')
    }
  }

  if ( ctx.message.text == user.emailCode ) {
    user.verifiedEmail = true
    await user.save()
    if ( user.verifiedPhone && user.verifiedEmail ) {
      ctx.reply('Telefono e codice e-mail confermati.')
      user.address = generateAddresses(user.passphrase[0])
      await user.save()
      await ctx.reply(`L'indirizzo della tuo cofanetto è ${ user.address }`)
      ctx.reply(`Il tuo link per invitare a 5 amici è ${user.link}`)
      sendVerifications(user.email, user.name, user.link)
      return ctx.scene.leave()
    } else {
      ctx.reply('Codice e-mail confermato. Ora /verifica_telefono')
    }
  }

  if ( ctx.message.text != user.phoneCode && ctx.message.text != user.emailCode ) {
    ctx.reply('Codice errato. Riprova.')
    return ctx.wizard.selectStep(currentStepIndex)
  }
})

const userVerification = new Scenes.WizardScene('userVerification',
  (ctx) => step1(ctx), step2
)

function logError(ctx, err) {
  ctx.reply("Succede qualcosa che non va.") 
  console.log(err)
  return ctx.scene.leave()
}

module.exports = { userVerification }