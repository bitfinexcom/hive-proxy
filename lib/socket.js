'use strict'

const SocketBase = require('./socket-base.js')
const CbQ = require('cbq')
const _ = require('lodash')

class Socket extends SocketBase {
  constructor (conf = {}) {
    super(conf)

    this.conf = {
      requestTimeout: 1000 * 5 // 5 secs
    }

    _.extend(this.conf, conf)

    this.cbq = new CbQ()
  }

  registerHandler (sock, target) {
    super.registerHandler(sock, target)

    this.on(target, (m) => {
      const res = JSON.parse(m.toString())

      if (res === null) {
        // success on order insert
        return
      }

      if (res && typeof res[0] === 'string' && /^ERR/.test(res[0])) {
        const id = res[1]
        this.cbq.trigger(id, new Error(res[0]), null)
        return
      }

      const id = res[2]

      const msg = [res[0], res[1]]
      this.cbq.trigger(id, null, msg)
    })

    return sock
  }

  send (reqId, ...msg) {
    return new Promise((resolve, reject) => {
      const timeout = this.conf.requestTimeout

      let cb
      if (typeof msg[msg.length - 1] === 'function') {
        cb = msg.pop()
      }

      super.send.apply(this, msg)

      const t = setTimeout(() => {
        this.cbq.trigger(reqId, new Error('ERR_TIMEOUT'))
      }, timeout)

      this.cbq.push(reqId, (err, res) => {
        clearTimeout(t)

        if (cb && err) return cb(err)
        if (cb) return cb(null, res)

        if (err) return reject(err)
        resolve(res)
      })
    })
  }
}

module.exports = Socket
