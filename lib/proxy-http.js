'use strict'

const requestTimeout = 1000 * 5 // 5 secs

const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')
const CbQ = require('cbq')
const Sock = require('./socket.js')

const s = new Sock({
  gateway: 'ipc:///tmp/proxy0',
  order0: 'ipc:///tmp/order0',
  user0: 'ipc:///tmp/user0'
})

const cbq = new CbQ()

const send = (reqId, ...msg) => {
  const cb = msg.pop()

  s.send.apply(s, msg)

  const t = setTimeout(() => {
    cbq.trigger(reqId, new Error('ERR_TIMEOUT'))
  }, requestTimeout)

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

const app = express()
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/gateway', (req, res) => {
  const body = req.body
  const reqId = uuid()

  body.push(reqId)

  send(reqId, 'gateway', body, (err, msg) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    res.json(msg)
  })
})

const Prox = {
  listen: (p) => {
    app.listen(p, () => {
      console.log(`Proxy listening on http://localhost:${p}`)
    })
  }
}

module.exports = Prox
