'use strict'

require('dotenv').config()
const ccxt = require('ccxt')
const saveOrder = require('../utils/saveOrder').saveOrder

const exchange = new ccxt.kraken({ apiKey: process.env.KRAKEN_APIKEY, secret: process.env.KRAKEN_SECRET })

let _symbol = process.env.KRAKEN_PAIR

async function exchangeInfo() {
  // Get MATIC/EUR pair
  let pair
  await exchange.loadMarkets()
  let symbols = await exchange.symbols
  symbols.forEach( (v,i) => {
    if(v === _symbol) {
      pair = i
    }
  })
  let book = await exchange.fetchOrderBook( exchange.symbols[pair])

  let balance = await exchange.fetchBalance()
  const data = { book, balance }
  return data
}

// TODO: Review crypto info book
async function exchangeCreateOrder( amount, bestPrice, user  ) {
  let pair
  amount = (amount / 10**18).toFixed(6) / 1
  bestPrice = (bestPrice / 10**18).toFixed(6) / 1
  let order = 'void'
  let symbols = await exchange.symbols
  symbols.forEach( (v,i) => {
    if (v === _symbol) {
      pair = i
    }
  })
  await exchange.fetchOrderBook( _symbol )
  let balance = await exchange.fetchBalance()
  balance = balance.info.result.MATIC / 1
  console.log("Price", bestPrice)
  if ( amount < balance ) {
    try {
      order = await exchange.createOrder(_symbol, 'limit' ,'sell', amount, bestPrice)
      saveOrder(order, user)
      console.log(order)
    } catch ( error ) {
      console.log(error)
    }
  }
  return order
}

module.exports = { exchangeInfo, exchangeCreateOrder }