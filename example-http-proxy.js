'use strict'

const request = require('request')
const Sock = require('./lib/socket.js')
const getOrder = require('./lib/order.js')

const s = new Sock({
  order0: 'ipc:///tmp/order0',
  user0: 'ipc:///tmp/user0'
})

setup()
post(['get_wallet', '1'])

setTimeout(() => {
  const o1 = getOrder({
    userId: '1',
    postOnly: 0,
    id: 9805964569,
    type: 'EXCHANGE LIMIT',
    amount: '0.1',
    price: '12.12',
    pair: 'BTCUSD'
  })

  const o2 = getOrder({
    userId: '2',
    postOnly: 0,
    id: 9805964570,
    type: 'EXCHANGE LIMIT',
    amount: '0.1',
    price: '12.12',
    pair: 'BTCUSD'
  })

  post(['insert_order', o1])
  post(['insert_order', o2])
}, 2000)

setTimeout(() => {
  post(['get_wallet', '1'])
}, 5000)

function post (opts) {
  request.post({
    uri: 'http://localhost:8000/gateway',
    json: true,
    body: opts
  }, (err, res, body) => {
    if (err) throw err

    console.log('post sent!')
    console.log(body)
  })
}

function setup () {
  //s.send('order0', ['test_engine_reset', []])
  //s.send('user0', ['test_engine_reset', []])

  s.send('user0', ['update_user_conf', [1, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]])
  s.send('user0', ['set_wallet_balance', [1, 'exchange', 'USD', '1000.00', null, null]])

  s.send('user0', ['update_user_conf', [2, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]])
  s.send('user0', ['set_wallet_balance', [2, 'exchange', 'USD', '1000.00', null, null]])
}
