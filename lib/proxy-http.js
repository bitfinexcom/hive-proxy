'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')

const Book = require('./book.js')
const BookScheduler = require('./bookscheduler.js')
const Sock = require('./socket.js')

class Prox {
  constructor (opts) {
    this.opts = opts
    this.pairs = opts.pairs

    this.app = express()
    this.setConfig()

    this.socket = new Sock({
      gateway: opts.endpoint
    })

    this.books = this.pairs.reduce((acc, el) => {
      const book = new Book({ pair: el })
      acc[el] = book
      return acc
    }, {})

    this.bookScheduler = new BookScheduler({
      pairs: this.pairs,
      socket: this.socket
    })

    this.bookScheduler.updateBooks(this.handleBookUpdate.bind(this))
    this.setupRoutes()
  }

  handleBookUpdate (_err, res) {
    const [pair, fullBook] = res
    const book = this.books[pair]
    book.update(fullBook)
  }

  setupRoutes () {
    this.app.post('/gateway', async (req, res) => {
      const body = req.body
      const reqId = uuid()

      body.push(reqId)

      try {
        const data = await this.socket.send(reqId, 'gateway', body)
        res.json(data)
      } catch (e) {
        console.error('err', e)
        return res.status(500).json(e)
      }
    })

    // https://api.bitfinex.com/v2/book/tBTCUSD/P0
    this.app.get('/v2/book/:pair/:prec', (req, res) => {
      const { pair, prec } = req.params

      function sendErrorBadRequest () {
        return res.status(400).json({ error: 'BAD_REQUEST' })
      }

      if (!prec || !pair) return sendErrorBadRequest()
      if (prec.toLowerCase() !== 'p0') return sendErrorBadRequest()
      if (!this.books[pair]) return res.status(400).json({ error: 'INVALID_PAIR' })

      const snap = this.books[pair].getSnapMessage()
      if (!snap[1]) return res.status(200).json([])

      return res.status(200).json(snap[1])
    })
  }

  setConfig () {
    this.app.use(bodyParser.json())

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })
  }

  listen () {
    this.app.listen(this.opts.port, () => {
      console.log(`Proxy listening on http://localhost:${this.opts.port}`)
    })
  }
}

module.exports = Prox
