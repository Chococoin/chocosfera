'use strict'

require('dotenv').config()
const fs = require('fs')
const infuraApi = process.env.INFURA_APIKEY
const mnemonic = process.env.MNEMONIC
const network = process.env.NETWORK
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')

const abi = require('../build/contracts/Treasury.json').abi
const netWorks = require('../build/contracts/Treasury.json').networks
let provider, contractAddress

if (network === 'development' ) {
  const lastNetwork = Object.keys(netWorks)[Object.keys(netWorks).length-1]
  contractAddress = require('../build/contracts/Treasury.json').networks[lastNetwork].address
  provider = new HDWalletProvider(mnemonic, `http://localhost:8545`)
} else {
  contractAddress = require('../build/contracts/Treasury.json').networks[network].address
  console.log("****CONTRACT ADDRESS****", contractAddress)
  // TODO: Switch to network according network Id 
  provider = new HDWalletProvider(mnemonic, `https://polygon-mumbai.infura.io/v3/${infuraApi}`)
}

const sender = provider.addresses[0]
const web3 = new Web3(provider)
const contract = new web3.eth.Contract(abi, contractAddress, { from: sender })
const Contract = contract.methods


module.exports = { web3, Contract }