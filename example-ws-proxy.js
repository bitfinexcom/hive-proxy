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

  const receivedWalletSnap = (parsed) => {
    if (!Array.isArray(parsed)) return false

    return parsed[1] === 'ws'
  }

  wsUser2.on('message', (data) => {
    console.log('ws2', data)
    const parsed = JSON.parse(data)
    if (!receivedWalletSnap(parsed)) return

    sendExchangeOrders(2)

    setTimeout(() => {
      sendMarginOrders(2)
    }, 1000)
  })

  ws.on('open', () => {
    ws.send(auth(1))
    ws.send(subscribeBook('BTCUSD'))
  })

  ws.on('message', (data) => {
    console.log('ws', data)

    const parsed = JSON.parse(data)
    if (!receivedWalletSnap(parsed)) return

    sendExchangeOrders(1)

    setTimeout(() => {
      sendMarginOrders(1)
    }, 1000)
  })

  setTimeout(() => {
    wsUser2.close()
  }, 10000)

  function getOrder (o) {
    return JSON.stringify([
      0,
      'on',
      null,
      o
    ])
  }

  let runs = 0
  function sendMarginOrders (user) {
    const o = {
      'type': 'LIMIT',
      'symbol': 'BTCUSD',
      'amount': '1.0',
      'price': '1'
    }

    if (user === 2) {
      wsUser2.send(getOrder(o))
      return
    }

    o.type = 'MARKET'
    o.amount = '-1.0'
    ws.send(getOrder(o))

    setTimeout(() => {
      if (runs === 1) return
      runs++

      sendMarginOrders(1)
      sendMarginOrders(2)
    }, 2000)
  }

  function sendExchangeOrders (user) {
    const o = {
      'type': 'EXCHANGE LIMIT',
      'symbol': 'BTCUSD',
      'amount': '1.0',
      'price': '1'
    }

    if (user === 2) {
      o.price = '1.2'
      o.amount = '-1.0'
      setTimeout(() => { wsUser2.send(getOrder(o)) }, 2000)
      return
    }

    o.price = '1.2'
    ws.send(getOrder(o))
    o.price = '1.2'
    ws.send(getOrder(o))

    setTimeout(() => {
      o.price = '2.2'
      o.amount = '-1.0'
      ws.send(getOrder(o))
      o.price = '2.3'
      o.amount = '-0.3'
      ws.send(getOrder(o))
    }, 2000)
  }

  function cancel (sock, id, pair) {
    const msg = [
      0,
      'oc',
      null,
      {
        id: id,
        pair: pair
      }
    ]

    sock.send(JSON.stringify(msg))
  }
})()
