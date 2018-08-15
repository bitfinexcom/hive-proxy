'use strict'

const request = require('request')
const Sock = require('./lib/socket.js')
const getOrder = require('./example-order.js')

;(async function () {
  await setup()

  const o1 = getOrder({
    user_id: 1,
    postOnly: 0,
    id: 9805964569,
    type: 'EXCHANGE LIMIT',
    amount: '-3',
    price: '12.12',
    pair: 'BTCUSD'
  })

  const o2 = getOrder({
    user_id: 2,
    postOnly: 0,
    id: 9805964570,
    type: 'EXCHANGE LIMIT',
    amount: '3',
    price: '12.12',
    pair: 'BTCUSD'
  })

  const o3 = getOrder({
    user_id: 2,
    postOnly: 0,
    id: 9805964600,
    type: 'EXCHANGE LIMIT',
    amount: '-3',
    price: '12.13',
    pair: 'BTCUSD'
  })

  await post(['insert_order', o1])
  await post(['insert_order', o2])

  setTimeout(async () => {
    const wallet1 = await post(['get_wallet', [1, 'exchange']])
    const wallet2 = await post(['get_wallet', [2, 'exchange']])

    console.log(wallet1)
    console.log(wallet2)

    o1.id = 9805964571
    await post(['insert_order', o1])

    o2.id = 9805964572
    o2.price = '9.99'
    await post(['insert_order', o2])

    o2.id = 9805964573
    o2.price = '8.99'
    await post(['insert_order', o2])

    o2.id = 9805964574
    await post(['insert_order', o2])

    await post(['insert_order', o3])

    setTimeout(async () => {
      console.log(await post(['get_book_depth', 'BTCUSD']))
    }, 250)
  }, 5000)
})()

function post (opts) {
  return new Promise((resolve) => {
    request.post({
      uri: 'http://localhost:8000/gateway',
      json: true,
      body: opts
    }, (err, res, body) => {
      if (err) throw err

      resolve(body)
    })
  })
}

function setup () {
  return new Promise((resolve) => {
    const s = new Sock({
      gateway: 'ipc:///tmp/proxy0',
      order0: 'ipc:///tmp/order0',
      user0: 'ipc:///tmp/user0'
    })

    s.send('order0', ['test_engine_reset', []])
    s.send('user0', ['test_engine_reset', []])
    s.send('gateway', ['set_gw_status', {'trigger_tickers': true, 'trigger_liq': true}])

    s.send('user0', ['update_user_conf', [1, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]])
    s.send('user0', ['set_wallet_balance', [1, 'exchange', 'USD', '1000.00', null, null]])
    s.send('user0', ['set_wallet_balance', [1, 'exchange', 'BTC', '1000.00', null, null]])

    s.send('user0', ['update_user_conf', [2, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]])
    s.send('user0', ['set_wallet_balance', [2, 'exchange', 'USD', '1000.00', null, null]])
    s.send('user0', ['set_wallet_balance', [2, 'exchange', 'BTC', '1000.00', null, null]])

    s.send('user0', ['set_wallet_balance', [2, 'exchange', 'BTC', '1000.00', null, null]])

    setTimeout(() => {
      resolve()
    }, 250)
  })
}
