/* eslint-env mocha */

'use strict'

const Sock = require('../lib/socket-base.js')
const assert = require('assert')

describe('base: simple communication', () => {
  it('connects with shards and gateway', (done) => {
    const s = new Sock({
      gateway: 'ipc:///tmp/proxy0',
      order0: 'ipc:///tmp/order0',
      user0: 'ipc:///tmp/user0'
    })

    s.on('user0', (msg) => {
      console.log('user0', msg.toString())
    })

    s.on('order0', (msg) => {
      console.log('order0', msg.toString())
    })

    s.on('gateway', (msg) => {
      console.log('gateway', msg.toString())

      const res = JSON.parse(msg.toString())
      assert.strictEqual(res[0]['trading-USD'].balance, 1000)
      s.close()
      done()
    })

    s.send('order0', ['test_engine_reset', []])
    s.send('user0', ['test_engine_reset', []])

    s.send('user0', ['update_user_conf', [1, { 'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2 }]])
    s.send('user0', ['set_wallet_balance', [1, 'trading', 'USD', '1000.00', null, null]])

    setTimeout(() => {
      s.send('gateway', ['get_wallet', [1, 'trading']])
    }, 250)
  })
})
