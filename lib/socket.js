'use strict'

const zmq = require('zmq')
const _ = require('lodash')

class Socket {
  constructor (conf = {}) {
    this.conf = {
      gateway: 'tcp://127.0.0.1:1837'
    }

    _.extend(this.conf, conf)

    const sock = zmq.socket('req')
    sock.on('message', (msg) => {
      console.log("-------------")
      console.log(msg)
    })

    sock.connect(this.conf.gateway)



    this.socks = {
      gateway: sock
    }
  }

  getSockLazy (target) {
    if (this.socks[target]) {
      return this.socks[target]
    }

    const sock = zmq.socket('req')
    sock.connect(this.conf[target])

    this.socks[target] = sock
    return sock
  }

  send (target, msg) {
    const str = JSON.stringify(msg)

    const sock = this.getSockLazy(target)
    sock.send(str)
  }
}

module.exports = Socket
