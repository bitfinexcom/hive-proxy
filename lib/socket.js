'use strict'

const zmq = require('zmq')
const _ = require('lodash')
const EventEmitter = require('events')

class Socket extends EventEmitter {
  constructor (conf = {}) {
    super(conf)

    this.conf = {}

    _.extend(this.conf, conf)

    this.socks = {}
  }

  getSockLazy (target) {
    if (this.socks[target]) {
      return this.socks[target]
    }

    const sock = zmq.socket('req')

    sock.on('message', (msg) => {
      this.emit(target, msg)
    })

    const addr = this.conf[target]
    sock.connect(addr)

    this.socks[target] = sock
    return sock
  }

  send (target, msg) {
    const str = JSON.stringify(msg)

    const sock = this.getSockLazy(target)
    sock.send(str)
  }

  close (target) {
    if (!target) {
      Object.keys(this.socks).forEach((sock) => {
        this.socks[sock].close()
      })

      return
    }

    this.socks[target].close()
  }
}

module.exports = Socket
