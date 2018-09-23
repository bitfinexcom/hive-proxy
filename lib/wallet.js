'use strict'

class Wallet {
  parse (d) {
    const copy = JSON.parse(JSON.stringify(d))

    if (this.isSnapshot(copy)) {
      return this.parseSnap(copy)
    }

    return this.parseUpdate(copy)
  }

  isSnapshot (u) {
    return true
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

  parseUpdate (update) {
    return update
  }
}

module.exports = Wallet
