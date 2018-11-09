'use strict'

const Sock = require('../lib/socket-base.js')

function setup () {
  return new Promise((resolve) => {
    const s = new Sock({
      gateway: 'ipc:///tmp/proxy0',
      order0: 'ipc:///tmp/order0',
      user0: 'ipc:///tmp/user0'
    })

    s.send('order0', ['test_engine_reset', []])
    s.send('user0', ['test_engine_reset', []])
    s.send('gateway', ['set_gw_status', { 'trigger_tickers': true, 'trigger_liq': true }])

    s.send('user0', ['update_user_conf', [1, { 'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2 }]])
    s.send('user0', ['set_wallet_balance', [1, 'exchange', 'USD', '1000.00', null, null]])
    s.send('user0', ['set_wallet_balance', [1, 'exchange', 'BTC', '1000.00', null, null]])
    s.send('user0', ['set_wallet_balance', [1, 'trading', 'USD', '500.00', null, null]])
    s.send('user0', ['set_wallet_balance', [1, 'trading', 'BTC', '600.00', null, null]])

    s.send('user0', ['update_user_conf', [2, { 'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2 }]])
    s.send('user0', ['set_wallet_balance', [2, 'exchange', 'USD', '1000.00', null, null]])
    s.send('user0', ['set_wallet_balance', [2, 'exchange', 'BTC', '1000.00', null, null]])
    s.send('user0', ['set_wallet_balance', [2, 'trading', 'USD', '500.00', null, null]])
    s.send('user0', ['set_wallet_balance', [2, 'trading', 'BTC', '600.00', null, null]])

    setTimeout(() => {
      s.close()

      resolve()
    }, 250)
  })
}

module.exports = setup
