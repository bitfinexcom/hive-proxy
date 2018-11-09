'use strict'

const { endpoint } = require('../config/ws.conf.json')
const Sock = require('../lib/socket-base.js')

function setup () {
  return new Promise((resolve) => {
    const s = new Sock({
      gateway: endpoint
    })

    s.send('gateway', ['set_gw_status', { 'trigger_tickers': true, 'trigger_liq': true }])

    s.send('gateway', ['update_user_conf', [1, { 'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2 }]])
    s.send('gateway', ['set_wallet_balance', [1, 'exchange', 'USD', '1000.00', null, null]])
    s.send('gateway', ['set_wallet_balance', [1, 'exchange', 'BTC', '1000.00', null, null]])
    s.send('gateway', ['set_wallet_balance', [1, 'trading', 'USD', '500.00', null, null]])
    s.send('gateway', ['set_wallet_balance', [1, 'trading', 'BTC', '600.00', null, null]])

    s.send('gateway', ['update_user_conf', [2, { 'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2 }]])
    s.send('gateway', ['set_wallet_balance', [2, 'exchange', 'USD', '1000.00', null, null]])
    s.send('gateway', ['set_wallet_balance', [2, 'exchange', 'BTC', '1000.00', null, null]])
    s.send('gateway', ['set_wallet_balance', [2, 'trading', 'USD', '500.00', null, null]])
    s.send('gateway', ['set_wallet_balance', [2, 'trading', 'BTC', '600.00', null, null]])

    setTimeout(() => {
      s.close()

      resolve()
    }, 250)
  })
}

module.exports = setup
