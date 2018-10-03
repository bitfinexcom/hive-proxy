'use strict'

const diff = require('./diff.js')

class Book {
  constructor (opt) {
    this.pair = opt.pair

    // p0 book
    // PRICE, COUNT, AMOUNT
    this.state = []
  }

  update (book) {
    this.state = book
  }

  diff (b) {
    const a = this.state
    return diff(a, b)
  }

  getState () {
    return this.state
  }
}

module.exports = Book
