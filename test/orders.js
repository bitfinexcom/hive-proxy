/* eslint-env mocha */

'use strict'

const Orders = require('../lib/orders.js')
const assert = require('assert')

describe('orders: state handling and parsing', () => {
  it('new snapshot is also returned in first connect with no orders', () => {
    const c = new Orders()
    const msgs = c.getMessages({})

    assert.deepStrictEqual(msgs[0], ['0', 'os', []])
  })

  it('new snapshot is returned on first update', () => {
    const c = new Orders()
    const msgs = c.getMessages(getOrders1())

    assert.strictEqual(msgs[0][1], 'os')
    const snap = msgs[0][2][0]
    assert.strictEqual(snap[0], 6004517516)
    assert.strictEqual(snap[3], 'BTCUSD')
  })

  it('returns empty arrays if no changes happened', () => {
    const c = new Orders()
    c.getMessages(getOrders1())

    const msgs = c.getMessages(getOrders1())

    assert.deepStrictEqual(msgs, [])
  })

  it('on: new order is added', () => {
    const c = new Orders()
    c.getMessages(getOrders1())

    const msgs = c.getMessages(getOrders2())

    assert.strictEqual(msgs[0][1], 'on')

    const parsed = msgs[0][2]
    assert.strictEqual(parsed[0], 1337)
    assert.strictEqual(parsed[3], 'BTCUSD')
  })

  it('on: two new orders are added', () => {
    const c = new Orders()
    c.getMessages({})

    const msgs = c.getMessages(getOrders2())

    assert.strictEqual(msgs.length, 2)

    const msg1 = msgs[0]
    const msg2 = msgs[1]
    assert.strictEqual(msg1[2][0], 6004517516)
    assert.strictEqual(msg2[2][0], 1337)
  })

  it('ou messages', () => {
    const c = new Orders()
    c.getMessages(getOrders1())

    const msgs = c.getMessages(getOrders1('2.0'))

    assert.strictEqual(msgs[0][1], 'ou')
    assert.strictEqual(msgs.length, 1)

    const parsed = msgs[0][2]

    assert.strictEqual(parsed[0], 6004517516)
    assert.strictEqual(parsed[6], '2.0')
    assert.strictEqual(parsed[3], 'BTCUSD')
  })

  it('oc messages', () => {
    const c = new Orders()
    c.getMessages(getOrders1())
    c.getMessages(getOrders2())

    const msgs = c.getMessages(getOrders1())
    assert.strictEqual(msgs[0][1], 'oc')
    assert.strictEqual(msgs.length, 1)

    const parsed = msgs[0][2]

    assert.strictEqual(parsed[0], 1337)
    assert.strictEqual(parsed[6], '1.0')
    assert.strictEqual(parsed[3], 'BTCUSD')
  })

  it('oc messages 2', () => {
    const c = new Orders()
    c.getMessages(getOrders1())
    const msgs = c.getMessages({})
    assert.strictEqual(msgs[0][1], 'oc')
    assert.strictEqual(msgs.length, 1)

    const parsed = msgs[0][2]

    assert.strictEqual(parsed[0], 6004517516)
    assert.strictEqual(parsed[6], '1.0')
    assert.strictEqual(parsed[3], 'BTCUSD')
  })
})

function getOrders1 (mod) {
  return {
    'tBTCUSD': [
      {
        'id': 6004517516,
        'user_id': 1,
        'pair': 'BTCUSD',
        'v_pair': 'BTCUSD',
        'mseq': 1,
        'active': 1,
        'status': 'ACTIVE',
        'amount': mod || '1.0',
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
}

function getOrders2 (mod) {
  const res = getOrders1(mod)
  res['tBTCUSD'].push({
    'id': 1337,
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
  })

  return res
}
