'use strict'

const _ = require('lodash')

class Book {
  constructor (opt) {
    this.pair = opt.pair
    this.chanId = opt.pair + ''

    // p0 book
    // PRICE, COUNT, AMOUNT
    this.state = {}
  }

  update (book) {
    const msgs = this.getMessages(book)

    this.state = this.transform(book)

    return msgs
  }

  transform (b) {
    const book = {}

    b.forEach((el) => {
      const k = this.getKey(el)
      book[k] = el
    })

    return book
  }

  getKey (el) {
    const [ price ] = el

    return `${price}`
  }

  diff (o, n) {
    const kOld = Object.keys(o)
    const kNew = Object.keys(n)

    // cancelled
    const removedFromBook = _.difference(kOld, kNew)
    const cancelled = removedFromBook.map((k) => {
      const [price, , amount] = o[k]
      // prepare for update  message
      return [price, 0, amount]
    })

    // new
    const addedToBook = _.difference(kNew, kOld)
    const new_ = addedToBook.map((k) => {
      return n[k]
    })

    // updated
    const onBothbooks = _.intersection(kNew, kOld)
    const updated = onBothbooks.reduce((acc, el) => {
      const [oPrice, oCount, oAmount] = o[el]
      const [nPrice, nCount, nAmount] = n[el]

      if (oPrice === nPrice && oCount === nCount && oAmount === nAmount) {
        return acc
      }

      acc.push(n[el])
      return acc
    }, [])

    const res = [].concat(cancelled, new_, updated)

    return res
  }

  getMessages (update) {
    const uBook = this.transform(update)

    const updated = this.diff(this.getState(), uBook)
    const chanId = this.chanId

    const msgs = []
    updated.forEach((el) => {
      msgs.push([chanId, el])
    })

    return msgs
  }

  getSnapMessage () {
    const s = this.getState()
    const res = []

    Object.keys(s).forEach((k) => {
      res.push(s[k])
    })

    return [this.chanId, res]
  }

  getState () {
    return this.state
  }
}

module.exports = Book
