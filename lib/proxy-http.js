'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')

const Sock = require('./socket.js')

const app = express()
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/gateway', async (req, res) => {
  const body = req.body
  const reqId = uuid()

  body.push(reqId)

  try {
    const data = await app.s.send(reqId, 'gateway', body)
    res.json(data)
  } catch (e) {
    console.log('err', e)
    return res.status(500).json(e)
  }
})

const Prox = {
  listen: (opts) => {
    app.listen(opts.port, () => {
      console.log(`Proxy listening on http://localhost:${opts.port}`)
    })

    app.s = new Sock({
      gateway: opts.endpoint
    })
  }
}

module.exports = Prox
