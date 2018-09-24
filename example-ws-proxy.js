'use strict'

const setup = require('./test/setup-engine.js')

const WebSocket = require('ws')

;(async function () {
  await setup()

  const ws = new WebSocket('ws://localhost:8888')

  const auth = () => {
    const msg = JSON.stringify({
      event: 'auth',
      id: '1'
    })
    ws.send(msg)
  }

  ws.on('open', () => {
    const msg = JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol: 'BTCUSD'
    })

    ws.send(msg)

    auth()
  })

  ws.on('message', (data) => {
    console.log(data)
  })

  setTimeout(() => {
    const o = {
      'type': 'EXCHANGE LIMIT',
      'symbol': 'BTCUSD',
      'amount': '1.0',
      'price': '1'
    }

    const getOrder = (o) => {
      return JSON.stringify([
        0,
        'on',
        null,
        o
      ])
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
  }, 800)
})()
