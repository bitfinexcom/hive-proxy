'use strict'

const uuid = require('uuid/v4')

class BookScheduler {
  constructor (opts) {
    this.pairs = opts.pairs
    this.sock = opts.socket

    this.scheduler = {}
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

  updateBooks (cb) {
    this.pairs.forEach((p) => {
      const task = (p, cb) => {
        this.getBook(p)
          .then((res) => { cb(null, res) })
          .catch((err) => { cb(err) })
      }

      this.schedule(p, task, p, (err, fullBook) => {
        if (err) return

        cb(null, [p, fullBook])
      })
    })
  }
}

module.exports = BookScheduler
