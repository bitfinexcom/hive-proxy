'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const Sock = require('./socket.js')

let s

const app = express()
app.use(bodyParser.json())

app.post('/gateway', (req, res) => {
  const body = req.body

  console.log(body)
  s.send('gateway', body)

  res.json(body)
})

const Prox = {
  listen: (p) => {
    s = new Sock({
      gateway: 'ipc:///tmp/proxy0'
    })

    app.listen(p, () => {
      console.log(`Proxy listening on http://localhost:${p}`)
    })
  }
}

module.exports = Prox
