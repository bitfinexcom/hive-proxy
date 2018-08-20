/* eslint-env mocha */

'use strict'

const Sock = require('../lib/socket.js')
const BaseSocket = require('../lib/socket-base.js')
const assert = require('assert')
const uuid = require('uuid/v4')

describe('ext: simple communication', () => {
  it('connects with shards and gateway', async () => {
    const s = new Sock({
      gateway: 'ipc:///tmp/proxy0'
    })

    const baseSocket = new BaseSocket({
      order0: 'ipc:///tmp/order0',
      user0: 'ipc:///tmp/user0'
    })

    baseSocket.send('order0', ['test_engine_reset', []])
    baseSocket.send('user0', ['test_engine_reset', []])

    baseSocket.send('user0', ['update_user_conf', [1, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]])
    baseSocket.send('user0', ['set_wallet_balance', [1, 'trading', 'USD', '1000.00', null, null]])

    return new Promise((resolve) => {
      setTimeout(async () => {
        const reqId = uuid()
        const res = await s.send(reqId, 'gateway', ['get_wallet', [1, 'trading'], reqId])

        assert.strictEqual(res[0]['trading-USD'].balance, 1000)

        s.close()
        baseSocket.close()
        resolve()
      }, 250)
    })
  }).timeout(10000)
})
