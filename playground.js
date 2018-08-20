'use strict'

const uuid = require('uuid/v4')
const CbQ = require('cbq')

const Sock = require('./lib/socket.js')
const s = new Sock({
  gateway: 'ipc:///tmp/proxy0',
  order0: 'ipc:///tmp/order0',
  user0: 'ipc:///tmp/user0'
})

const cbq = new CbQ()

const send = (...msg) => {
  const cb = msg.pop()

  s.send.apply(s, msg)

  const t = setTimeout(() => {
    cbq.trigger(reqId, new Error('ERR_TIMEOUT'))
  }, 3000)

  cbq.push(reqId, (err, res) => {
    clearTimeout(t)
    if (err) return cb(err)

    cb(null, res)
  })
}

s.on('gateway', (m) => {
  const res = JSON.parse(m.toString())
  const id = res[2]

  const msg = [res[0], res[1]]
  cbq.trigger(id, null, msg)
})

const reqId = uuid()
send('gateway', ['set_gw_status', {'trigger_tickers': true, 'trigger_liq': true}, reqId], (err, res) => {
  if (err) console.error('error', err)

  console.log('res:', res)
})
