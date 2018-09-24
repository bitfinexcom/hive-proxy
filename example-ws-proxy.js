'use strict'

// const setup = require('./test/setup-engine.js')

const WebSocket = require('ws')

;(async function () {
  // await setup()

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
    const order = JSON.stringify([
      0,
      'on',
      null,
      {
        'type': 'EXCHANGE LIMIT',
        'symbol': 'BTCUSD',
        'amount': '1.0',
        'price': '1'
      }
    ])

    ws.send(order)
  }, 800)
})()
