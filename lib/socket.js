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

      const id = res[2]

      const msg = [res[0], res[1]]
      this.cbq.trigger(id, null, msg)
    })

    return sock
  }

  send (reqId, ...msg) {
    return new Promise((resolve) => {
      const timeout = this.conf.requestTimeout
      super.send.apply(this, msg)

      const t = setTimeout(() => {
        this.cbq.trigger(reqId, new Error('ERR_TIMEOUT'))
      }, timeout)

      this.cbq.push(reqId, (err, res) => {
        clearTimeout(t)
        if (err) throw err

        resolve(res)
      })
    })
  }
}

module.exports = Socket
