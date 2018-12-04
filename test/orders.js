/* eslint-env mocha */

'use strict'

const Orders = require('../lib/orders.js')
const assert = require('assert')

describe('orders: state handling and parsing', () => {
  it('returns diffs if updates found, parses them', () => {
    const c = new Orders([])

    const orders1 = {
      'tBTCUSD': [
        {
          'id': 6004517516,
          'user_id': 1,
          'pair': 'BTCUSD',
          'v_pair': 'BTCUSD',
          'mseq': 1,
          'active': 1,
          'status': 'ACTIVE',
          'amount': '1.0',
          'amount_orig': '1.0',
          'hidden': 0,
          'type': 'EXCHANGE LIMIT',
          'type_prev': null,
          'routing': 'MB>HP',
          'meta': null,
          '_trg': null,
          '_v': 3,
          '_rix': 0,
          'price': '1.2',
          'price_avg': '0.0',
          'swap_rate_max': '0.0075',
          'gid': null,
          'cid': null,
          'cid_date': '2018-01-09',
          'flags': 0,
          'lcy_post_only': 0,
          'placed_id': null,
          'vir': 1,
          'created_at': '2018-01-09T11:50:18.330Z',
          'tif': null
        }
      ]
    }

    const diff1 = c.update(orders1)
    assert.deepStrictEqual([[
      6004517516,
      null,
      null,
      'BTCUSD',
      1515498618330,
      1515498618330,
      '1.0',
      '1.0',
      'EXCHANGE LIMIT',
      null,
      null,
      null,
      0,
      'ACTIVE',
      null,
      null,
      '1.2',
      '0.0',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ]], diff1)
  })

  it('returns diffs if updates found', () => {
    const c = new Orders([])
    // new order
    const orders1 = {
      'tBTCUSD': [
        {
          'id': 6004517516,
          'user_id': 1,
          'pair': 'BTCUSD',
          'v_pair': 'BTCUSD',
          'type': 'EXCHANGE LIMIT'
        }
      ]
    }

    const diff1 = c.update(orders1)
    assert.strictEqual(diff1[0][0], 6004517516)
    assert.strictEqual(diff1.length, 1)

    // new order
    const orders2 = {
      'tBTCUSD': [
        {
          'id': 6004517516,
          'user_id': 1,
          'pair': 'BTCUSD',
          'v_pair': 'BTCUSD',
          'type': 'EXCHANGE LIMIT'
        },
        {
          'id': 1337,
          'user_id': 1,
          'pair': 'BTCUSD',
          'v_pair': 'BTCUSD',
          'type': 'EXCHANGE LIMIT'
        }
      ]
    }

    const diff2 = c.update(orders2)
    assert.strictEqual(diff2[0][0], 1337)
    assert.strictEqual(diff2.length, 1)

    // order update
    const orders3 = {
      'tBTCUSD': [
        {
          'id': 6004517516,
          'user_id': 1,
          'pair': 'BTCUSD',
          'v_pair': 'BTCUSD',
          'type': 'EXCHANGE LIMIT'
        },
        {
          'id': 1337,
          'user_id': 1,
          'pair': 'BTCUSD',
          'v_pair': 'BTCUSD',
          'type': 'EXCHANGE MARKET'
        }
      ]
    }
    const diff3 = c.update(orders3)
    assert.strictEqual(diff3[0][8], 'EXCHANGE MARKET')
    assert.strictEqual(diff3.length, 1)
  })
})
