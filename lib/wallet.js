'use strict'

const _ = require('lodash')

class Wallet {
  constructor (state) {
    this.state = state || []

    this.sentSnap = false
  }

  update (d) {
    const copy = JSON.parse(JSON.stringify(d))
    const nSnap = this.parseSnap(copy)

    const diff = this.diff(this.state, nSnap)

    this.state = nSnap

    return diff
  }

  diff (o, n) {
    if (o.length === 0 && n.length === 0) return []
    if (o.length === 0 && n.length > 0) return n

    const updated = _.differenceWith(n, o, (oVal, nVal) => {
      const [ type, cur, amount, amountInterst ] = oVal
      const [ ntype, ncur, namount, namountInterst ] = nVal

      return type === ntype && cur === ncur && amount === namount &&
        amountInterst === namountInterst
    })

    return updated
  }

  getState () {
    return this.state
  }

  parseSnap (snap) {
    const res = Object.keys(snap).map((k) => {
      const el = snap[k]
      const entry = [
        el.wallettype,
        el.currency,
        el.balance,
        el.unsettled_interest,
        null
      ]

      return entry
    })

    return res
  }
}

module.exports = Wallet
