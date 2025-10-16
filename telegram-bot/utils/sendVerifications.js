require('dotenv').config()
const sgMail = require('@sendgrid/mail')
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY
sgMail.setApiKey(SENDGRID_APIKEY)

// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
// const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
// const sms = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
// const TWILIO_PHONE = process.env.TWILIO_PHONE


async function sendVerifications (mail, name, link) {

  let email = ( mail, name, link ) => {
    const msg = {
      personalizations: [
        {
          to: [
            {
              email: mail,
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
      templateId: "d-bfea8d7b1c4f4d2caf131ef2a303fd63",
      dynamic_template_data: {
        name,
        link
      },
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      }
    }
    // let msg = {
    //   to: mail,
    //   from: SENDGRID_VALID_EMAIL,
    //   subject: 'Your Chocosfera Account was successfully verified.',
    //   text: `Hi ${ username || 'Dear customer' }!\n\nYour user account was registered and verified successfully!\n\nYour link to invite your best 5 friends is ${ link }\n\n😃 Have a nice day!`,
    //   html: `<p>Hi ${ username || 'Dear customer' }!\n\nYour user account was registered and verified successfully!\n\nYour link to invite your best 5 friends is ${ link }\n\n😃 Have a nice day!</p>`
    // }
    return msg
  }

  const msg = email( mail, name, link )

  // sms.messages
  //   .create({
  //     body: `Hi ${username || 'Dear customer'}! Your user account was registered and verified successfully! You are one step to the rear of create your art and mint your owns NFT using our telegram bot.`,
  //     from: `${TWILIO_PHONE}`,
  //     to: '+39' + phone
  //   })
  //   .then(message => console.log(message.sid))
  //   .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

async function sendRegistration (name, mail, phoneCode, emailCode) {

  let email = ( name, mail, phoneCode, emailCode ) => {
    const msg = {
      personalizations: [
        {
          to: [
            {
              email: mail
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
      templateId: "d-c3b35be5e9894396835ce40e543d75dd",
      dynamic_template_data: {
        name,
        phoneCode,
        emailCode
      },
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      }
    }
    return msg
  }

  const msg = email( name, mail, phoneCode, emailCode )

  // sms.messages
  //   .create({
  //     body: `Hi ${ name || 'Dear customer' }! Your user account was registered. To verify it successfully, please enter this code -> ${phoneCode} at phone verification phase.`,
  //     from: `${TWILIO_PHONE}`,
  //     to: '+39' + phone
  //   })
  //   .then(message => console.log(message.sid))
  //   .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error.response.body)})
}

module.exports = { sendRegistration, sendVerifications }