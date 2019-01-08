'use strict'

// <‘ws’, ’wu’>
const BaseComponent = require('./base-state')

class Wallet extends BaseComponent {
  hasEntryUpdated (o, n) {
    if (o.balance !== n.balance) return true
    return false
  }

  getMessages (update) {
    const { new_, updated } = this.diff(this.getRawState(), update)

    this.rawState = update

    if (this.sentSnap === false) {
      this.sentSnap = true
      return [['0', 'ws', new_]]
    }

    const msgs = []
    ;[].concat(updated, new_).forEach((el) => {
      msgs.push(['0', 'wu', el])
    })

    return msgs
  }

  parse (el) {
    return [
      el.wallettype,
      el.currency,
      el.balance,
      null,
      null
    ]
  }

  parseSnap (snap) {
    const res = Object.keys(snap).map((k) => {
      const entry = this.parse(snap[k])
      return entry
    })

    return res
  }
}

module.exports = Wallet
