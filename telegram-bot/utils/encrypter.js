const CryptoJS = require("crypto-js")
const bip39 = require('bip39')
require('dotenv').config()
const encryptionKey = process.env.ENTROPY
const decrypter = require('./decrypter.js')

function encrypter () {
  const passphrase = bip39.generateMnemonic()
  const encrypted = (CryptoJS.AES.encrypt(passphrase, encryptionKey)).toString()
  const decrypted = decrypter(encrypted, encryptionKey)
  if (passphrase === decrypted){
    return encrypted
  } else {
    return new TypeError('Not_a_passphrase')
  }

}

module.exports = encrypter
