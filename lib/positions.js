'use strict'

class Positions {
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
    snap = snap || {}
    const res = Object.keys(snap).map((k) => {
      const p = snap[k]

      const entry = [
        p.pair,
        p.status,
        p.amount,
        p.base,
        null,
        null,
        null,
        null,
        null,
        null,
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

module.exports = Positions
