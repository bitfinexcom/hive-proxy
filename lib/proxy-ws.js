'use strict'

const uuid = require('uuid/v4')

const BaseWs = require('./base-proxy-ws.js')
const Sock = require('./socket.js')

const Wallet = require('./wallet.js')
const Orders = require('./orders.js')
const PositionTools = require('./positions.js')

const pt = new PositionTools()

const Book = require('./book.js')
const formatOrder = require('./hive-order-helper.js')

function _authPlugin (connId, msg, cb) {
  cb(null, { connId, data: msg })
}

class ProxyWs extends BaseWs {
  constructor (opts) {
    super(opts.ws)

    this.pairs = opts.pairs

    this.channels = {
      book: this.getBookChannels()
    }

    this.authUsers = {}

    this.authPlugin = opts.authPlugin || _authPlugin

    this.sock = new Sock({
      gateway: opts.endpoint
    })

    this.clients = {}

    this.scheduler = {}
    this.updateBooks()
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

    if (msg[1] === 'oc') {
      this.cancelOrder(ws, msg)
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

    this.authPlugin(connId, msg, (err, res) => {
      if (err) {
        return this.sendAuthError(ws)
      }

      const { id } = res.data

      const user = {
        id: +id,
        wallet: new Wallet(),
        orders: new Orders(),
        positions: null
      }

      this.authUsers[connId] = user

      this.subscribeUserdata(ws, id)
    })
  }

  getUserdata (userId, cb) {
    const payload = ['get_user_data', [+userId]]
    this.sendReqToHive(payload, cb)
  }

  sendReqToHive (payload, cb) {
    const reqId = uuid()
    payload.push(reqId)

    this.sock.send(reqId, 'gateway', payload, (err, res) => {
      if (err) {
        console.error(
          `request ${reqId} failed, payload: ${payload}, error:${err}`
        )
      }

      cb(err, res)
    })
  }

  updateUser (ws, connId, res) {
    const user = this.authUsers[connId]
    if (!user) return

    try {
      this.maybeSendSnapshot(
        ws,
        'ws',
        'wu',
        user.wallet,
        res.wallets
      )

      this.maybeSendSnapshot(
        ws,
        'os',
        'ou',
        user.orders,
        res.orders
      )

      user.positions = pt.parse(res.positions)
    } catch (e) {}
  }

  maybeSendSnapshot (ws, ks, ku, managedState, data) {
    const diff = managedState.update(data)
    const state = managedState.getState()

    if (diff.length === 0) return

    if (!managedState.sentSnap) {
      managedState.sentSnap = true
      this.send(ws, ['0', ks, state])
      return
    }

    diff.forEach((el) => {
      this.send(ws, ['0', ku, diff])
    })
  }

  subscribeUserdata (ws, id) {
    const connId = ws.id

    this.getUserdata(id, (err, res) => {
      if (err) return
      if (!this.authUsers[connId]) return

      res = res[0]
      if (res) {
        this.updateUser(ws, connId, res)
        this.sendAuthUpdates(ws, connId)
      }

      if (!this.authUsers[connId]) return
      setTimeout(() => {
        this.subscribeUserdata(ws, id)
      }, 1500)
    })
  }

  sendAuthUpdates (ws, connId) {
    const data = this.authUsers[connId]
    if (!data) return

    this.send(ws, ['0', 'ps', data.positions])
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

  terminate (ws) {
    const connId = ws.id

    delete this.authUsers[connId]

    ws.terminate()
  }

  send (ws, msg) {
    try {
      ws.send(JSON.stringify(msg))
    } catch (e) {
      this.terminate(ws)
    }
  }

  sendAuthError (ws) {
    const err = { event: 'error', msg: 'user: invalid', code: 20000 }
    return this.send(ws, err)
  }

  cancelOrder (ws, payload) {
    const _cancel = payload[3]
    const connId = ws.id
    const authUser = this.authUsers[connId]

    if (!authUser) {
      this.sendAuthError(ws)
    }

    const msg = ['cancel_order', { 'id': _cancel.id, 'v_pair': _cancel.pair }]
    this.sendReqToHive(msg, (err, res) => {
      if (err) {
        this.sendAuthError(ws)
      }

      const inner = [
        _cancel.id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        0,
        null,
        null,
        null,
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]

      const ocn = [
        1538584137068,
        'oc-req',
        null,
        null,
        inner,
        null,
        'SUCCESS',
        'Submitted for cancellation; waiting for confirmation (ID: unknown).'
      ]

      this.send(ws, [0, 'n', ocn])
    })
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
    const clients = wsChannel.clients
    clients.forEach((connId) => {
      if (!this.authUsers[connId]) {
        const index = clients.indexOf(connId)
        if (index !== -1) {
          clients.splice(index, 1)
        }

        return
      }

      this.wss.clients.forEach((ws) => {
        if (ws.id === connId) {
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
