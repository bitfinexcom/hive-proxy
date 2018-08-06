'use strict'

const Sock = require('./lib/socket.js')

const s = new Sock({
  user: 'tcp://127.0.0.1:1337', // shard 0 in tcp mode
  gateway: 'tcp://127.0.0.1:1837', // 1337 + 500
  user0: null, // shard calculation with preferred algo,
  icpUser0: 'ipc:///tmp/user0'
})

s.send('gateway', ['set_gw_status', {'trigger_tickers': true, 'trigger_liq': true}])

s.send(
  'user',
  [
    'update_user_conf',
    [1, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]
  ]
)

s.send(
  'icpUser0',
  [
    'update_user_conf',
    [1, {'ccys_margin': ['USD', 'BTC', 'ETH', 'LTC', 'JPY', 'EUR'], 'margin_version': 2}]
  ]
)
