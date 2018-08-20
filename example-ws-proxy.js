'use strict'

// const setup = require('./test/setup-engine.js')

const WebSocket = require('ws')

;(async function () {
  // await setup()

  const ws = new WebSocket('ws://localhost:8888')

  ws.on('open', () => {
    const msg = JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol: 'BTCUSD'
    })

    ws.send(msg)
  })

  ws.on('message', (data) => {
    console.log(data)
  })
})()
