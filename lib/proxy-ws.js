'use strict'

const uuid = require('uuid/v4')
const _ = require('lodash')

const diff = require('./diff.js')
const BaseWs = require('./base-proxy-ws.js')
const Sock = require('./socket.js')

class ProxyWs extends BaseWs {
  constructor (opts) {
    super(opts.ws)

    this.pairs = opts.pairs

    this.channels = {
      book: this.getBookChannels()
    }

    this.authUsers = {}

    this.sock = new Sock({
      gateway: opts.endpoint
    })

    this.clients = {}

    this.updateBooks()
  }

  async getWallet (id) {
    const reqId = uuid()
    let res = null
    try {
      res = await this.sock.send(reqId, 'gateway', ['get_wallet', [id, 'exchange'], reqId])
    } catch (e) {
      console.error(e)
      return
    }

    return res
  }

  getBookChannels () {
    const bookChannels = this.pairs.reduce((acc, el) => {
      acc[el] = { id: uuid(), clients: [], book: {} }
      return acc
    }, {})

    return bookChannels
  }

  messageHook (ws, msg) {
    if (msg && msg.event) {
      return this.handleEvent(ws, msg)
    }
  }

  connectionHook (ws) {
    ws.id = uuid()
  }

  handleEvent (ws, msg) {
    if (msg.event === 'subscribe') {
      this.subscribeBook(ws, msg)
    }

    if (msg.event === 'auth') {
      this.auth(ws, msg)
    }
  }

  auth (ws, msg) {
    const connId = ws.id

    const { id } = msg

    this.authUsers[connId] = id

    this.subscribeWallet(ws, connId, id)
  }

  async subscribeWallet (ws, id) {
    const res = await this.getWallet(id)
    if (res) this.send(ws, ['0', 'ws', res[0]])

    setTimeout(async () => {
      if (!this.authUsers[connId]) return

      await this.subscribeWallet(ws, connId, id)
    }, 2000)
  }

  subscribeBook (ws, msg) {
    const connId = ws.id

    const {
      symbol,
      channel
    } = msg

    if (!this.channels[channel]) {
      console.error('malformed msg')
      return
    }

    if (!this.channels[channel][symbol]) {
      console.error('malformed msg')
      return
    }

    const wsChannel = this.channels[channel][symbol]
    const channelId = wsChannel.id

    if (wsChannel.clients.includes(connId)) {
      return
    }

    wsChannel.clients.push(connId)

    this.send(ws, {
      event: 'subscribed',
      channel: 'book',
      chanId: channelId,
      symbol: symbol
    })

    this.send(ws, [
      channelId,
      'os',
      wsChannel.book
    ])
  }

  getConnection (id) {
    let res = null

    // lookup in Set
    this.wss.clients.forEach((ws) => {
      if (ws.id === id) {
        res = ws
        return false
      }
    })

    return res
  }

  terminate (id) {
    Object.keys(this.channels).forEach((channel) => {
      this.channels[channel].forEach((type) => {
        _.pull(this.channels[channel][type], id)
      })
    })

    delete this.authUsers[id]

    const ws = this.getConnection(id)
    ws.terminate()
  }

  send (ws, msg) {
    ws.send(JSON.stringify(msg))
  }

  sendToSubscribed (wsChannel, msg) {
    wsChannel.clients.forEach((clientId) => {
      this.wss.clients.forEach((ws) => {
        if (ws.id === clientId) {
          this.send(ws, msg)
        }
      })
    })
  }

  updateBooks () {
    this.intervalsBook = {}

    this.pairs.forEach((p) => {
      this.intervalsBook[p] = setInterval(async () => {
        const reqId = uuid()
        let res = null
        try {
          res = await this.sock.send(reqId, 'gateway', ['get_book_depth', p, reqId])
        } catch (e) {
          console.error(e)
          return
        }

        const ob = res[0]

        const wsChannel = this.channels['book'][p]

        const newBook = this.createBook(ob || [])
        this.sendOrderbookUpdates(wsChannel, wsChannel.book, newBook)

        wsChannel.book = newBook
      }, 1000)
    })
  }

  createBook (ob) {
    const res = {}

    ob.forEach((el) => {
      const price = el[0]
      res[price] = el
    })

    return res
  }

  getSnap (ob) {
    const res = []

    Object.keys(ob).forEach((el) => {
      res.push(el)
    })

    return res
  }

  sendOrderbookUpdates (wsChannel, oldBook, newBook) {
    const chanId = wsChannel.id
    const changes = diff(oldBook, newBook)

    changes.forEach((el) => {
      this.sendToSubscribed(wsChannel, [chanId, el])
    })
  }
}

module.exports = ProxyWs
