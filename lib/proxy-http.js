'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')

const Sock = require('./socket.js')

const s = new Sock({
  gateway: 'ipc:///tmp/proxy0'
})

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
    const data = await s.send(reqId, 'gateway', body)
    res.json(data)
  } catch (e) {
    console.log('err', e)
    return res.status(500).json(e)
  }
})

const Prox = {
  listen: (p) => {
    app.listen(p, () => {
      console.log(`Proxy listening on http://localhost:${p}`)
    })
  }
}

module.exports = Prox
