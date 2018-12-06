'use strict'

const _ = require('lodash')
const BaseComponent = require('./base-state')

class Wallet extends BaseComponent {
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
