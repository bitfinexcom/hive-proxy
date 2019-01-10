/* eslint-env mocha */

'use strict'

const Book = require('../lib/book.js')
const assert = require('assert')

describe('book: state handling and parsing', () => {
  it('returns current state as snapshot', () => {
    const b = new Book({ pair: 'BTCUSD' })

    const data = [
      [ '1.0', 2, '2.0' ],
      [ '2.2', 1, '-1.0' ],
      [ '2.3', 1, '-0.3' ]
    ]

    b.update(data)

    const [chainId, snap] = b.getSnapMessage()

    assert.deepStrictEqual(chainId, 'BTCUSD')

    let found = 0
    data.forEach((el) => {
      const [amount, count, price] = el
      const seen = snap.some((sEl) => {
        const [samount, scount, sprice] = el

        return samount === amount && sprice === price && scount === count
      })

      if (seen) found++
    })

    assert.strictEqual(found, 3, 'all elements in snapshot')
  })

  it('handles empty snapshots', () => {
    const b = new Book({ pair: 'BTCUSD' })

    const data = []
    b.update(data)

    const msg = b.getSnapMessage()

    assert.deepStrictEqual(msg, ['BTCUSD', []])
  })

  it('handles cancelled messages', () => {
    const b = new Book({ pair: 'BTCUSD' })

    const data = [
      [ '1.0', 2, '2.0' ],
      [ '2.2', 1, '-1.0' ],
      [ '2.3', 1, '-0.3' ]
    ]

    b.update(data)

    const msgs = b.update([
      [ '1.0', 2, '2.0' ],
      [ '2.3', 1, '-0.3' ]
    ])

    assert.deepStrictEqual(msgs[0], ['BTCUSD', [ '2.2', 0, '-1.0' ]])
  })

  it('handles newly added elements', () => {
    const b = new Book({ pair: 'BTCUSD' })

    b.update([
      [ '1.0', 2, '2.0' ]
    ])

    const msgs = b.update([
      [ '1.0', 2, '2.0' ],
      [ '2.2', 1, '-1.0' ],
      [ '2.3', 1, '0.3' ]
    ])

    assert.deepStrictEqual(msgs[0], ['BTCUSD', [ '2.2', 1, '-1.0' ]])
    assert.deepStrictEqual(msgs[1], ['BTCUSD', [ '2.3', 1, '0.3' ]])
  })

  it('handles updated elements', () => {
    const b = new Book({ pair: 'BTCUSD' })

    const data = [
      [ '1.0', 2, '2.0' ],
      [ '2.2', 1, '-1.0' ]
    ]

    b.update(data)

    const msgs = b.update([
      [ '1.0', 2, '2.0' ],
      [ '2.2', 1, '-1.3' ]
    ])

    assert.deepStrictEqual(msgs[0], ['BTCUSD', [ '2.2', 1, '-1.3' ]])
  })

  it('no update, empty message array', () => {
    const b = new Book({ pair: 'BTCUSD' })

    const data = [
      [ '1.0', 2, '2.0' ],
      [ '2.2', 1, '-1.0' ]
    ]

    b.update(data)
    const msgs = b.update(data)

    assert.deepStrictEqual(msgs, [])
  })
})
