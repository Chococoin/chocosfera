const CryptoJS = require("crypto-js")
require('dotenv').config()

function decrypter(text) {
  const key = process.env.ENTROPY
  const decrypted = CryptoJS.AES.decrypt(text, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports = decrypter