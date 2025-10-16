const ethers = require('ethers')
const decrypter = require('./decrypter')

module.exports = function generateAddresses(passphrase) {

  let mnemonic = decrypter(passphrase)
  const wallet = ethers.Wallet.fromMnemonic(mnemonic)
  
  return wallet.address
}