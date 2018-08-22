'use strict'

const _ = require('lodash')

function diff (o, n) {
  const oldb = _.cloneDeep(o)
  const newb = _.cloneDeep(n)

  const res = []

  const entriesOld = Object.keys(oldb)
  const entriesNew = Object.keys(newb)

  const onBothbooks = _.intersection(entriesOld, entriesNew)

  if (onBothbooks.length) {
    onBothbooks.forEach((k) => {
      if (oldb[k][1] !== newb[k][1] ||
          oldb[k][2] !== newb[k][2]) {
        res.push(newb[k])
      }
    })
  }

  const removedFromBook = _.difference(entriesOld, entriesNew)
  if (removedFromBook.length) {
    removedFromBook.forEach((k) => {
      const entry = oldb[k]
      entry[1] = 0
      res.push(entry)
    })
  }

  const addedToBook = _.difference(entriesNew, entriesOld)
  if (addedToBook.length) {
    addedToBook.forEach((k) => {
      const entry = newb[k]
      res.push(entry)
    })
  }

  return res
}

module.exports = diff
