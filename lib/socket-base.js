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

  registerHandler (sock, target) {
    sock.on('message', (msg) => {
      this.emit(target, msg)
    })

    return sock
  }

  getSockLazy (target) {
    if (this.socks[target]) {
      return this.socks[target]
    }

    const sock = zmq.socket('req')
    this.registerHandler(sock, target)

    const addr = this.conf[target]
    sock.connect(addr)

    this.socks[target] = sock

    return sock
  }

  send (target, msg) {
    const str = JSON.stringify(msg)

    this.getSockLazy(target)
    this.socks[target].send(str)
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
