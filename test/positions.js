/* eslint-env mocha */

'use strict'

const Positions = require('../lib/positions.js')
const assert = require('assert')

describe('positions: state handling, parsing and messages', () => {
  it('new snapshot is returned on first update', () => {
    const c = new Positions()
    const msgs = c.getMessages(getPosition1())

    const res1 = [ 'BTCUSD', 'ACTIVE', '1.0', '1.2', '0', null, null,
      null, null, null, null ]

    assert.deepStrictEqual(msgs[0], ['0', 'ps', [ res1 ]])
  })

  it('empty array is returned if no update happens', () => {
    const c = new Positions()
    const msgs = c.getMessages(getPosition1())

    const res1 = [ 'BTCUSD', 'ACTIVE', '1.0', '1.2', '0', null, null,
      null, null, null, null ]

    assert.deepStrictEqual(msgs, ['0', 'ps', [ res1 ]])

    const res = c.getMessages(getPosition1())
    assert.deepStrictEqual(res, [])
  })

  it('pn is returned for an added position', () => {
    const c = new Positions()
    const msgs = c.getMessages(getPosition1())

    const res1 = [ 'BTCUSD', 'ACTIVE', '1.0', '1.2', '0', null, null,
      null, null, null, null ]

    assert.deepStrictEqual(msgs, ['0', 'ps', [ res1 ]])

    const res = c.getMessages(getTwoPositions())

    const res2 = [ 'ETHUSD', 'ACTIVE', '3.0', '2.2', '0', null, null,
      null, null, null, null ]

    assert.deepStrictEqual(res[0], ['0', 'pn', res2])
  })

  it('pu is returned for a changed position', () => {
    const c = new Positions()
    c.getMessages(getTwoPositions())

    const contentExp = [ 'BTCUSD', 'ACTIVE', '2.0', '1.2', '0', null, null,
      null, null, null, null ]

    const resPu = c.getMessages(getTwoPositions('2.0'))

    assert.deepStrictEqual(resPu[0], ['0', 'pu', contentExp])
  })

  it('pc is returned for a removed position', () => {
    const c = new Positions()
    c.getMessages(getTwoPositions())

    const contentExp = [ 'ETHUSD', 'ACTIVE', '3.0', '2.2', '0', null, null,
      null, null, null, null ]

    const resPc = c.getMessages(getPosition1())
    assert.deepStrictEqual(resPc[0], ['0', 'pc', contentExp])
  })

  it('pn, pu, pc at same time', () => {
    const c = new Positions()
    c.getMessages(getTwoPositions())

    const changed = getTwoPositions('13')
    delete changed.ETHUSD
    changed['EOSUSD'] = {
      user_id: 1,
      type: 0,
      pair: 'EOSUSD',
      status: 'ACTIVE',
      amount: '2.5',
      base: '2.5',
      swap: '0'
    }

    const res = c.getMessages(changed)
    assert.deepStrictEqual(
      res,
      [
        [ '0', 'pn', [ 'EOSUSD', 'ACTIVE', '2.5', '2.5', '0',
          null, null, null, null, null, null ]],
        [ '0', 'pu', [ 'BTCUSD', 'ACTIVE', '13', '1.2', '0',
          null, null, null, null, null, null ] ],
        [ '0', 'pc', [ 'ETHUSD', 'ACTIVE', '3.0', '2.2', '0',
          null, null, null, null, null, null ] ]
      ]
    )
  })
})

function getPosition1 (modifier) {
  return {
    BTCUSD: {
      user_id: 1,
      type: 0,
      pair: 'BTCUSD',
      status: 'ACTIVE',
      amount: modifier || '1.0',
      base: '1.2',
      swap: '0'
    }
  }
}

function getTwoPositions (modifier) {
  return {
    BTCUSD: getPosition1(modifier).BTCUSD,
    ETHUSD: {
      user_id: 1,
      type: 0,
      pair: 'ETHUSD',
      status: 'ACTIVE',
      amount: '3.0',
      base: '2.2',
      swap: '0'
    }
  }
}
