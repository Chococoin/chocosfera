const random = require('random')

function randomCode(){
  return random.int((min = 100000), (max = 999999))
}

module.exports = randomCode