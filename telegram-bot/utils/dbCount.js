const createLink = require('./createLink')
const User = require('../Schemas/User.js')
const { faker } = require('@faker-js/faker')

async function newSession(data) {
  let partner = await User.findOne({username: data.username})
  partner.session++
  partner.save()
  console.log(`${partner.username} has interacted with the bot ${partner.session} times`)
}

async function newUser(ctx, origin) {
  let data, referer, link, returned_linkObj
  try {
    returned_linkObj = await createLink(ctx, origin)
    link = returned_linkObj.invite_link
  } catch( error ) {
    console.log(error.description)
    console.log("error.description")
    link = 'broken_link'
  }
  if ( origin === 'direct' ) {
    data = ctx.update.message.from
    data.message_id = ctx.update.message.message_id
    referer = 0
  }
  if ( origin === 'indirect' ) {
    data = ctx.update.chat_join_request.from
    data.message_id = ctx.update.message.message_id
    referer = ctx.update.chat_join_request.invite_link.name.split('-')[1]
  }
  let username = data.username || 'No_username'
  let name = data.first_name
  let language = data.language_code
  let telegramID = data.id
  let sinceMessageID = data.message_id ? data.message_id : 0
  let email = faker.finance.pin(6) + '@tempo.ral'
  let phone = '555' + faker.finance.pin(7)
  const user = new User({ username, name, language, telegramID, referer, sinceMessageID, link, email, phone })
  user.save()
  console.log(`${ username } is a new user with referer link ${ link }.`)
  ctx.reply(`${ username } is a new user with referer link ${ link }.`)
  return link
}

async function dbCount(ctx) {
  let data = ctx.update.message
  let visitor
  try {
    visitor = await User.findOne({ telegramID: data.from.id})
  } catch( error ) {
    console.log(error)
  }
  if ( visitor ) {
    newSession(visitor)
  } else {
    newUser(ctx, 'direct')
  }
}

module.exports = dbCount