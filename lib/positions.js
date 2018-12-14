'use strict'

// <‘pn’, ’pu’, ‘pc’>
const _ = require('lodash')
const BaseComponent = require('./base-state')

class Positions extends BaseComponent {
  hasEntryUpdated (o, n) {
    if (o.amount !== n.amount) return true
    if (o.status !== n.status) return true
    if (o.base !== n.base) return true
    if (o.swap !== n.swap) return true

    return false
  }

  diff (_o, _n) {
    const o = JSON.parse(JSON.stringify(_o))
    const n = JSON.parse(JSON.stringify(_n))

    const entriesOld = Object.keys(o)
    const entriesNew = Object.keys(n)
    const onBoth = _.intersection(entriesOld, entriesNew)

    const res = { new_: [], updated: [], cancelled: [] }

    // pu
    if (onBoth.length) {
      onBoth.forEach((k) => {
        if (this.hasEntryUpdated(o[k], n[k])) {
          res.updated.push(this.parse(n[k]))
        }
      })
    }

    // pn
    const added = _.difference(entriesNew, entriesOld)
    if (added.length) {
      added.forEach((k) => {
        const entry = this.parse(n[k])
        res.new_.push(entry)
      })
    }

    // pc
    const removed = _.difference(entriesOld, entriesNew)
    if (removed.length) {
      removed.forEach((k) => {
        const entry = this.parse(o[k])
        res.cancelled.push(entry)
      })
    }

    return res
  }

  getRawState () {
    return this.rawState
  }

  getMessages (update) {
    const { new_, updated, cancelled } = this.diff(this.getRawState(), update)

    this.rawState = update

    if (this.sentSnap === false) {
      this.sentSnap = true
      return [['0', 'ps', new_]]
    }

    const msgs = []
    new_.forEach((el) => {
      msgs.push(['0', 'pn', el])
    })

    updated.forEach((el) => {
      msgs.push(['0', 'pu', el])
    })

    cancelled.forEach((el) => {
      msgs.push(['0', 'pc', el])
    })

    return msgs
  }

  parse (p) {
    return [
      p.pair,
      p.status,
      p.amount,
      p.base,
      p.swap,
      null,
      null,
      null,
      null,
      null,
      null
    ]
  }
}

module.exports = Positions
