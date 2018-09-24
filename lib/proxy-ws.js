'use strict'

const uuid = require('uuid/v4')
const _ = require('lodash')

const BaseWs = require('./base-proxy-ws.js')
const Sock = require('./socket.js')

const WalletTools = require('./wallet.js')
const wt = new WalletTools()
const Book = require('./book.js')
const formatOrder = require('./hive-order-helper.js')

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

    this.scheduler = {}
    this.updateBooks()
  }

  async getWallet (id) {
    const reqId = uuid()

    let res = null
    const payload = ['get_wallet', [+id, 'exchange'], reqId]
    try {
      res = await this.sock.send(reqId, 'gateway', payload)
    } catch (e) {
      console.error(e + '_get_wallet', payload)
      throw e
    }

    return res
  }

  async getBook (symbol) {
    const reqId = uuid()

    let res = null
    const payload = ['get_book_depth', symbol, reqId]
    try {
      res = await this.sock.send(reqId, 'gateway', payload)
    } catch (e) {
      console.error(e)
      return
    }

    return res[0]
  }

  schedule (id, fun, args, cb) {
    this.scheduler[id] = setTimeout(async () => {
      fun.call(fun, args, (err, res) => {
        if (err) console.error(err)
        if (res) cb(null, res)

        this.schedule(id, fun, args, cb)
      })
    }, 1000)
  }

  updateBooks () {
    this.intervalsBook = {}

    this.pairs.forEach((p) => {
      const task = (p, cb) => {
        this.getBook(p)
          .then((res) => { cb(null, res) })
          .catch((err) => { cb(err) })
      }

      this.schedule(p, task, p, (err, fullBook) => {
        if (err) return

        const wsChannel = this.channels.book[p]
        const book = wsChannel.book

        const diff = book.diff(fullBook)
        book.update(fullBook)

        if (diff.length === 0) return

        // TODO send partial updates from diff
        this.sendOrderbookUpdates(wsChannel, fullBook)
      })
    })
  }

  getBookChannels () {
    const bookChannels = this.pairs.reduce((acc, el) => {
      const book = new Book({ pair: el })
      acc[el] = { id: el, clients: [], book: book, updater: null }
      return acc
    }, {})

    return bookChannels
  }

  messageHook (ws, msg) {
    if (!msg) return

    if (msg.event) {
      return this.handleEvent(ws, msg)
    }

    if (Array.isArray(msg)) {
      return this.handleMessage(ws, msg)
    }
  }

  connectionHook (ws) {
    ws.id = uuid()
  }

  handleMessage (ws, msg) {
    if (msg[1] === 'on') {
      return this.sendOrder(ws, msg)
    }
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

    this.authUsers[connId] = { id: +id }

    this.subscribeWallet(ws, connId, id)
  }

  async subscribeWallet (ws, connId, id) {
    let res

    try {
      res = await this.getWallet(id)
    } catch (e) { console.error('wallet request failed') }

    if (res) {
      const parsed = wt.parse(res[0])
      this.send(ws, ['0', 'ws', parsed])
    }

    setTimeout(async () => {
      if (!this.authUsers[connId]) return

      try {
        await this.subscribeWallet(ws, connId, id)
      } catch (e) { console.error('wallet request failed') }
    }, 3000)
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
      wsChannel.book.getState()
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

  async sendOrder (ws, payload) {
    const _order = payload[3]
    const connId = ws.id
    const authUser = this.authUsers[connId]

    if (!authUser) {
      const err = { event: 'error', msg: 'user: invalid', code: 20000 }
      return this.send(ws, err)
    }

    const reqId = uuid()
    const f = formatOrder({
      userId: authUser.id,
      ..._order
    })

    const msg = ['insert_order', f, reqId]
    try {
      await this.sock.send(reqId, 'gateway', msg)
    } catch (e) {
      console.error('insert_order request failed')
      console.error(e)

      if (e.message === 'ERR_BAL') {
        const err = {
          event: 'error',
          msg: 'order: insufficient balance',
          code: null
        }

        return this.send(ws, err)
      }

      const err = { event: 'error', msg: e.message || e.toString() }
      this.send(ws, err)
    }

    const te = [0, 'te', []]
    this.send(ws, te)
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

  sendOrderbookUpdates (wsChannel, snap) {
    const chanId = wsChannel.id

    const orderbookMessage = [chanId, snap]
    this.sendToSubscribed(wsChannel, orderbookMessage)
  }
}

module.exports = ProxyWs
