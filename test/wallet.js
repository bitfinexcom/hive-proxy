/* eslint-env mocha */

'use strict'

const Wallet = require('../lib/wallet.js')
const assert = require('assert')

describe('wallet: state handling and parsing', () => {
  it('returns diffs if updates found', () => {
    const w = new Wallet([])

    const balance1 = {
      'exchange-USD': {
        user_id: 2,
        name: 'exchange',
        wallettype: 'exchange',
        currency: 'USD',
        balance: '1000.0',
        unsettled_interest: '0'
      },
      'exchange-BTC': {
        user_id: 2,
        name: 'exchange',
        wallettype: 'exchange',
        currency: 'BTC',
        balance: '1000.0',
        unsettled_interest: '0'
      }
    }
    const diff1 = w.update(balance1)

    assert.deepStrictEqual([
      [ 'exchange', 'USD', '1000.0', '0', null ],
      [ 'exchange', 'BTC', '1000.0', '0', null ]
    ], diff1)

    const diff2 = w.update(balance1)
    assert.deepStrictEqual([], diff2)

    const balance2 = {
      'exchange-USD': {
        user_id: 2,
        name: 'exchange',
        wallettype: 'exchange',
        currency: 'USD',
        balance: '500.0',
        unsettled_interest: '0'
      },
      'exchange-BTC': {
        user_id: 2,
        name: 'exchange',
        wallettype: 'exchange',
        currency: 'BTC',
        balance: '1000.0',
        unsettled_interest: '0'
      }
    }

    const diff3 = w.update(balance2)
    assert.deepStrictEqual(
      [[ 'exchange', 'USD', '500.0', '0', null ]],
      diff3
    )
  })
})
