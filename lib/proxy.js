'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const Sock = require('./socket.js')

const app = express()
app.use(bodyParser.json())

app.post('/gateway', (req, res) => {
  const body = req.body

  const s = new Sock({
    gateway: 'ipc:///tmp/proxy0'
  })

  s.send('gateway', body)

  s.on('gateway', (msg) => {
    const parsed = JSON.parse(msg.toString())
    res.json(parsed)
    s.close()
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
