const artifacts = require('./build/contracts/Treasury.json')
const contract = require('@truffle/contract')
const T = contract(artifacts)
T.setProvider(web3.currentProvider)

T.deployed().then(i => console.log(i.address)).catch(err => console.log(err))
