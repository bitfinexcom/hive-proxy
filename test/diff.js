/* eslint-env mocha */

'use strict'

const diff = require('../lib/diff.js')
const assert = require('assert')

describe('order book diff helper', () => {
  it('detects entry changes with same price, but amount changed', () => {
    const o = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ]
    }

    const n = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 11 ]
    }

    assert.deepStrictEqual([[ -8.99, 4, 11 ]], diff(o, n))
  })

  it('detects entry changes with same price, but count changed', () => {
    const o = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ]
    }

    const n = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 3, 12 ]
    }

    assert.deepStrictEqual([[ -8.99, 3, 12 ]], diff(o, n))
  })

  it('returns empty list if nothign changed', () => {
    const o = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ]
    }

    const n = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ]
    }

    assert.deepStrictEqual([], diff(o, n))
  })

  it('adds removed entries with the correct count', () => {
    const o = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ]
    }

    const n = {
      '-16.1': [ -16.1, 1, 1 ]
    }

    assert.deepStrictEqual([[ -8.99, 0, 12 ]], diff(o, n))
  })

  it('adds new entries', () => {
    const o = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ]
    }

    const n = {
      '-16.1': [ -16.1, 1, 1 ],
      '-8.99': [ -8.99, 4, 12 ],
      '-7.99': [ -7.99, 3, 3 ]
    }

    assert.deepStrictEqual([[ -7.99, 3, 3 ]], diff(o, n))
  })
})
