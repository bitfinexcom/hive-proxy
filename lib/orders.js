'use strict'

const _ = require('lodash')
const BaseComponent = require('./base-state')

class Orders extends BaseComponent {
  diff (o, n) {
    if (o.length === 0 && n.length === 0) return []
    if (o.length === 0 && n.length > 0) return n

    const updated = n.filter((el) => {
      const hasSame = o.some((oEl) => {
        return el.every((val, i) => {
          if (Number.isNaN(val) && Number.isNaN(oEl[i])) {
            return true
          }

          return val === oEl[i]
        })
      })

      return !hasSame
    })

    return updated
  }

  parseSnap (data) {
    const res = _.flatten(Object.keys(data).map((k) => {
      return this.parsePair(data[k])
    }))

    return res
  }

  parsePair (entry) {
    const res = entry.map((o) => {
      const entry = [
        o.id,
        o.gid,
        o.cid,
        o.pair,
        new Date(o.created_at).getTime(),
        o.updated_at ? new Date(o.updated_at).getTime() : new Date(o.created_at).getTime(),
        o.amount,
        o.amount_orig,
        o.type,
        o.type_prev,
        null,
        null,
        o.flags,
        o.status,
        null,
        null,
        o.price,
        o.price_avg,
        o.price_trailing || null,
        o.price_aux_limit || null,
        null,
        null,
        null,
        null,
        null,
        o.placed_id || null
      ]

      return entry
    })

    return res
  }
}

module.exports = Orders
