const User = require('../Schemas/User.js')

async function saveOrder(order, user) {
  let _user = await User.findOne({ telegramId: user })
  console.log("USER :", _user)
  console.log(order)
}


module.exports = { saveOrder }