'use strict'

const _ = require('lodash')

class StatefulComponent {
  constructor () {
    this.state = []
    this.rawState = {}

    this.sentSnap = false
  }

  update (d) {
    const copy = JSON.parse(JSON.stringify(d))
    const nSnap = this.parseSnap(copy)

    const diff = this.diff(this.state, nSnap)

    this.state = nSnap

    return diff
  }

  getState () {
    return this.state
  }

  getRawState () {
    return this.rawState
  }

  diff (_o, _n) {
    const o = JSON.parse(JSON.stringify(_o))
    const n = JSON.parse(JSON.stringify(_n))

    const entriesOld = Object.keys(o)
    const entriesNew = Object.keys(n)
    const onBoth = _.intersection(entriesOld, entriesNew)

    const res = { new_: [], updated: [], cancelled: [] }

    // xu
    if (onBoth.length) {
      onBoth.forEach((k) => {
        if (this.hasEntryUpdated(o[k], n[k])) {
          res.updated.push(this.parse(n[k]))
        }
      })
    }

    // xn
    const added = _.difference(entriesNew, entriesOld)
    if (added.length) {
      added.forEach((k) => {
        const entry = this.parse(n[k])
        res.new_.push(entry)
      })
    }

    // xc
    const removed = _.difference(entriesOld, entriesNew)
    if (removed.length) {
      removed.forEach((k) => {
        const entry = this.parse(o[k])
        res.cancelled.push(entry)
      })
    }

    return res
  }

  parse () {
    throw new Error('not implemented')
  }

  parseSnap () {
    throw new Error('not implemented')
  }
}

module.exports = StatefulComponent
