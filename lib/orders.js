'use strict'

class Orders {
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
    if (!Array.isArray(snap)) return []

    const res = snap.map((o) => {
      const entry = [
        o.id,
        o.gid,
        o.cid,
        o.pair,
        new Date(o.created_at).getTime(),
        new Date(o.updated_at).getTime(),
        o.amount,
        o.amount_orig,
        o.type,
        o.type_prev,
        o.status,
        o.price,
        o.price_avg,
        o.price_trailing || null,
        o.price_aux_limit || null,
        o.placed_id || null,
        o.flags
      ]

      return entry
    })

    return res
  }

  parseUpdate (update) {
    return update
  }
}

module.exports = Orders
