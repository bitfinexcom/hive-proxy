'use strict'

// <‘pn’, ’pu’, ‘pc’>
const BaseComponent = require('./base-state')

class Positions extends BaseComponent {
  hasEntryUpdated (o, n) {
    if (o.amount !== n.amount) return true
    if (o.status !== n.status) return true
    if (o.base !== n.base) return true
    if (o.swap !== n.swap) return true

    return false
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
