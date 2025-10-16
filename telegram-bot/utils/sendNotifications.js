require('dotenv').config()
const sgMail = require('@sendgrid/mail')
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY
sgMail.setApiKey(SENDGRID_APIKEY)

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const sms = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const TWILIO_PHONE = process.env.TWILIO_PHONE

const User = require('../Schemas/User.js')

async function sendNotifications (mail, phone) {

  let email = ( mail ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: 'This is a notification from chococryptoBot.',
      text: `Your account is confirmed.`,
      html: `<p>Your account is confirmed.</p>`
    }
    return msg
  }

  const msg = email( mail )

  sms.messages
    .create({
      body: `Your account is confirmed.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

async function sendNFTNotifications (mail, phone, NFTdata) {
  let email = ( mail ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: `ChocoCryptoBot: Your have mint the NFT titled ${NFTdata.metadata.name}`,
      html: '<h1>Your have mint an NFT</h1>' +
            '<h3>TOKEN ID:</h3>' +
            `<p>${NFTdata.tokenId}</p>` +
            '<h3>OWNER ADDRESS</h3>' +
            `<p>${NFTdata.ownerAddress}</p>` +
            '<h3>NFT TITLE</h3>' +
            `<p>${NFTdata.metadata.name}</p>` +
            '<h3>NFT DESCRIPTION</h3>' +
            `<p>${NFTdata.metadata.description}</p>` +
            '<h3>NFT IMAGE</h3>' +
            `<p>${NFTdata.metadata.image}</p>` +
            '<h3>NFT METADATA</h3>' +
            `<p>${NFTdata.metadataGatewayURL}</p>`
    }
    return msg
  }

  const msg = email( mail )

  sms.messages
    .create({
      body: `Your have mint an NFT title ${NFTdata.metadata.name}. For more info check your email.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

async function sendNFTTreeNotifications (mail, phone, NFTdata) {
  console.log("From sending", NFTdata.metadata)
  let email = ( mail ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: `ChocoCryptoBot: Your have mint the NFT Tree located at ${ NFTdata.metadata.name }`,
      html: '<h1>Your have mint an NFT</h1>' +
            '<h3>TOKEN ID:</h3>' +
            `<p>${NFTdata.tokenId}</p>` +
            '<h3>OWNER ADDRESS</h3>' +
            `<p>${NFTdata.ownerAddress}</p>` +
            '<h3>NFT TITLE</h3>' +
            `<p>${NFTdata.metadata.name}</p>` +
            '<h3>NFT DESCRIPTION</h3>' +
            `<p>${NFTdata.metadata.description}</p>` +
            '<h3>NFT IMAGE</h3>' +
            `<p>${NFTdata.metadata.image}</p>` +
            '<h3>NFT METADATA</h3>' +
            `<p>${NFTdata.metadataGatewayURL}</p>` +
            '<h3>NFT LOCALIZATION</h3>' +
            `<p>${NFTdata.metadata.geoposition}</p>`
    }
    return msg
  }

  const msg = email( mail )

  sms.messages
    .create({
      body: `Your have mint an NFT title ${NFTdata.metadata.name}. For more info check your email.`,
      from: `${TWILIO_PHONE}`,
      to: '+39' + phone
    })
    .then(message => console.log(message.sid))
    .catch((error) => {console.error(error)})

  sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
}

async function sendPollNotifications ( userCreator, phone, NFTdata ) {
  
  const users = await User.find({})
  let email = ( mail ) => {
    let msg = {
      to: mail,
      from: SENDGRID_VALID_EMAIL,
      subject: `ChocoCryptoBot: ${userCreator.username} have created a new poll.`,
      html: '<h1>A new poll was created for your DAO</h1>' 
      // '<h3>TOKEN ID:</h3>' +
      // `<p>${NFTdata.tokenId}</p>` +
      // '<h3>OWNER ADDRESS</h3>' +
      // `<p>${NFTdata.ownerAddress}</p>` +
      // '<h3>NFT TITLE</h3>' +
      // `<p>${NFTdata.metadata.name}</p>` +
      // '<h3>NFT DESCRIPTION</h3>' +
      // `<p>${NFTdata.metadata.description}</p>` +
      // '<h3>NFT IMAGE</h3>' +
      // `<p>${NFTdata.metadata.image}</p>` +
      // '<h3>NFT METADATA</h3>' +
      // `<p>${NFTdata.metadataGatewayURL}</p>`
    }
    return msg
  }
  users.forEach((user) => {
    console.log("Sending poll notification to:", user.email)
    const msg = email( user.email )
    sgMail.send(msg)
    .then(console.log( "Email sent"))
    .catch((error) => {console.error(error)})
  })


  // sms.messages
  //   .create({
  //     body: `Your have mint an NFT title ${ NFTdata.metadata.name }. For more info check your email.`,
  //     from: `${ TWILIO_PHONE }`,
  //     to: '+39' + phone
  //   })
  //   .then(message => console.log(message.sid))
  //   .catch((error) => {console.error(error)})

  // sgMail.send(msg)
  //   .then(console.log( "Email sent"))
  //   .catch((error) => {console.error(error)})
}

module.exports = { sendNotifications , sendNFTNotifications, sendNFTTreeNotifications, sendPollNotifications }
