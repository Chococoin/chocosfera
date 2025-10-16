const { faker } = require('@faker-js/faker')
const createLink = require('../utils/createLink')
const User = require('../Schemas/User.js')

async function noteUser(ctx, origin) {
  let data, referer, user
  console.log("NewUser: ", ctx.update)
  console.log("Origin: ", origin)
  // TODO: Set in Smartcontract
  // await setReferee()
  let { invite_link : link } = await createLink(ctx, origin)
  if (origin === 'direct') {
    data = ctx.update.message.from
    data.message_id = ctx.update.message.message_id
    referer = 0
  }
  if (origin === 'indirect') {
    data = ctx.update.chat_join_request.from
    referer = ctx.update.chat_join_request.invite_link.name.split('-')[1]
    console.log("Indirect", referer, data)
  }
  let telegramID = data.id
  try{
    user = await User.findOne({ telegramID: data.id })
  } catch(err) {
    console.log("MongoDb fail", err)
  }
  if( !user ) {
    let email = faker.finance.pin(6) + '@tempo.ral'
    let phone = '555' + faker.finance.pin(7)
    let username = data.username || 'No_username'
    let name = data.first_name
    let language = data.language_code
    let sinceMessageID = data.message_id ? data.message_id : 0
    user = new User({ username, name, language, telegramID, referer, sinceMessageID, link, email, phone })
    console.log(`${username} is a new user with referer link ${link}.`)
    user.save()
  } else {
    user.language = data.language_code
  }
  return link
}

module.exports = { noteUser }
