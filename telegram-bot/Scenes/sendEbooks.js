'use strict'
require('dotenv').config()
const { Scenes, Composer } = require('telegraf')
const User = require('../Schemas/User.js')
const sgMail = require('@sendgrid/mail')
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY
sgMail.setApiKey(SENDGRID_APIKEY)

const { Telegraf } = require('telegraf')
const telegramApiKey = process.env.TELEGRAM_APIKEY
const app = new Telegraf(telegramApiKey)

const crypto = require('crypto')
const bip39 = require('bip39')
const fs = require('fs')


let user

sgMail.setApiKey(SENDGRID_APIKEY)

async function sendEmail (data) {
  const book = fs.readFileSync('Jung, Carl Gustav - Sincronicidad.epub')
  const base64String = new Buffer.from(book).toString('base64')
  const list = data.listXeBook
  const name = data.name
  const link = data.link

  list.forEach(async email => {
    const msg = {
      personalizations: [
        {
          to: [
            {
              email,
            }
          ]
        }
      ],
      from: {
        email: SENDGRID_VALID_EMAIL,
        name: "Fractalbook's Deliveries"
      },
      replyTo: {
        email: 'no_reply@chocosfera.com',
        name: 'No Reply Team'
      },
      templateId: "d-e32810fe03784e9c900debca2148537b",
      dynamic_template_data: {
        name,
        link
      },
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      },
      attachments: [
        {
          content: base64String,
          filename: 'sincronicidad.epub',
          type: 'application/epub+zip',
          disposition: 'attachment'
        }
      ]
    }

    if ( email === '100@mailsac.com' ) {
      try {
        let res = await sgMail.send(msg)
        console.log(`Email sent to ${ email } ${ res }`)
        console.log(res)
      } catch ( error ) {
        console.log(error.response.body)
      }
    }
  })
}

const step1 = async (ctx) => {
  try {
    user = await User.findOne({ telegramID: ctx.update.callback_query.from.id })
  } catch (err) {
    ctx.reply('Ho sperimentato un problema con il db. <b>riprova più tarde</b>')
    return ctx.scene.leave()
  }
  let origin = ctx.update.callback_query.message.chat.type == 'group' ? 'group' : 'private'
  if ( origin === 'private' || origin === 'group') {
    if ( user && user.verifiedEmail && user.verifiedPhone ) {
      await ctx.replyWithHTML('Stai per regalare un libro a ciascuno dei tuoi 5 migliore amici.\n' +
      'Controlla attentamente l\'essatezza dell\'email\n' +
      `1) ${ user.listXeBook[0] }\n` +
      `2) ${ user.listXeBook[1] }\n` +
      `3) ${ user.listXeBook[2] }\n` +
      `4) ${ user.listXeBook[3] }\n` +
      `5) ${ user.listXeBook[4] }\n` +
      '<b>Spedici i libri ai tuoi amici e fai un tesoro.</b>\n'
      )
      return ctx.wizard.next() && app.telegram.sendMessage(ctx.update.callback_query.message.chat.id, 'Per spedire clicca /send per cancellare /cancel')
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
  ctx.reply('Sospeso invio di emails')
  return ctx.scene.leave()
})

step2.command('send', async (ctx) => {
  let res = await sendEmail(user)
  return ctx.scene.leave()
})

step2.on('message', async ( ctx ) => {
   ctx.replyWithHTML('Per spedire le cinque email clicca\n/send\nper cancellare\n/cancel')

})

const sendEbooks = new Scenes.WizardScene('sendEbooks',
  (ctx) => step1(ctx), step2
)

module.exports = sendEbooks
