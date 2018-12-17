'use strict'

const BaseComponent = require('./base-state')

class Orders extends BaseComponent {
  hasEntryUpdated (o, n) {
    let updated = false

    const props = [
      'active',
      'status',
      'amount',
      'amount_orig',
      'hidden',
      'type',
      'meta',
      'price',
      'price_avg'
    ]

    for (let i = 0; i < props.length; i++) {
      const prop = props[i]

      if (Number.isNaN(o[prop]) && Number.isNaN(n[prop])) {
        continue
      }

      if (o[prop] !== n[prop]) {
        updated = true
        break
      }
    }

    return updated
  }

  diff (o, n) {
    const pairsNew = Object.keys(n)
    const pairsOld = Object.keys(o)

    const res = { new_: [], updated: [], cancelled: [] }

    pairsNew.forEach((p) => {
      // on
      if (!o[p]) {
        n[p].forEach((el) => {
          const entry = this.parse(el)
          res.new_.push(entry)
        })

        return
      }

      const oldIds = o[p].map((el) => { return el.id })
      const newIds = n[p].map((el) => { return el.id })

      n[p].forEach((el) => {
        const { id } = el

        if (!oldIds.includes(id)) {
          const entry = this.parse(el)
          res.new_.push(entry)
          return
        }

        const oldEntry = o[p].find((el) => {
          return el.id === id
        })

        // ou
        if (this.hasEntryUpdated(oldEntry, el)) {
          const entry = this.parse(el)
          res.updated.push(entry)
        }
      })

      // oc
      o[p].forEach((el) => {
        if (!newIds.includes(el.id)) {
          const entry = this.parse(el)
          res.cancelled.push(entry)
        }
      })
    })

    // oc - no single order -> no pair
    pairsOld.forEach((po) => {
      if (pairsNew.includes(po)) return
      o[po].forEach((el) => {
        const entry = this.parse(el)
        res.cancelled.push(entry)
      })
    })

    return res
  }

  getMessages (update) {
    const { new_, updated, cancelled } = this.diff(this.getRawState(), update)

    this.rawState = update

    if (this.sentSnap === false) {
      this.sentSnap = true
      return [['0', 'os', new_]]
    }

    const msgs = []
    new_.forEach((el) => {
      msgs.push(['0', 'on', el])
    })

    updated.forEach((el) => {
      msgs.push(['0', 'ou', el])
    })

    cancelled.forEach((el) => {
      msgs.push(['0', 'oc', el])
    })

    return msgs
  }

  parse (o) {
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
  }
}

module.exports = Orders
