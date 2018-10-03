'use strict'

const setup = require('./test/setup-engine.js')

const WebSocket = require('ws')

;(async function () {
  await setup()

  const ws = new WebSocket('ws://localhost:8888')
  const wsUser2 = new WebSocket('ws://localhost:8888')

  const auth = (id) => {
    return JSON.stringify({
      event: 'auth',
      id: id
    })
  }

  const subscribeBook = (symbol) => {
    return JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol: symbol
    })
  }

  wsUser2.on('open', () => {
    wsUser2.send(auth(2))
    wsUser2.send(subscribeBook('BTCUSD'))
  })

  wsUser2.on('message', (data) => {
    console.log('wsUser2', data)
  })

  ws.on('open', () => {
    ws.send(auth(1))
    ws.send(subscribeBook('BTCUSD'))
  })

  ws.on('message', (data) => {
    console.log('ws', data)
  })

  setTimeout(() => {
    sendMarginOrders()
  }, 400)

  setTimeout(() => {
    sendExchangeOrders()
  }, 800)

  setTimeout(() => {
    wsUser2.close()
  }, 1200)

  function getOrder (o) {
    return JSON.stringify([
      0,
      'on',
      null,
      o
    ])
  }

  function sendMarginOrders () {
    const o = {
      'type': 'LIMIT',
      'symbol': 'BTCUSD',
      'amount': '1.0',
      'price': '1'
    }

    wsUser2.send(getOrder(o))

    o.type = 'MARKET'
    o.amount = '-1.0'
    ws.send(getOrder(o))
  }

  function sendExchangeOrders () {
    const o = {
      'type': 'EXCHANGE LIMIT',
      'symbol': 'BTCUSD',
      'amount': '1.0',
      'price': '1'
    }

    ws.send(getOrder(o))
    o.price = '1.2'
    ws.send(getOrder(o))
    o.price = '1.2'
    ws.send(getOrder(o))

    o.price = '2.2'
    o.amount = '-1.0'
    ws.send(getOrder(o))
    o.price = '2.3'
    o.amount = '-0.3'
    ws.send(getOrder(o))
  }
})()
