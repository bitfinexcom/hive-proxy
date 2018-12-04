'use strict'

class StatefulComponent {
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

  getState () {
    return this.state
  }

  diff (o, n) {
    throw new Error('not implemented')
  }

  parseSnap () {
    throw new Error('not implemented')
  }
}

module.exports = StatefulComponent
