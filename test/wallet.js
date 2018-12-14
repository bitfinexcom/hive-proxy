/* eslint-env mocha */

'use strict'

const Wallet = require('../lib/wallet.js')
const assert = require('assert')

describe('wallet: state handling and parsing', () => {
  it('new snapshot is also returned in first connect with n positions', () => {
    const c = new Wallet()
    const msgs = c.getMessages({})

    assert.deepStrictEqual(msgs[0], ['0', 'ws', []])
  })

  it('new snapshot is returned on first update', () => {
    const c = new Wallet()
    const msgs = c.getMessages(getWalletState1())
    const parsed = [
      [ 'exchange', 'USD', '1000.0', '0', null ],
      [ 'exchange', 'BTC', '1000.0', '0', null ]
    ]

    assert.deepStrictEqual(msgs[0], ['0', 'ws', parsed])
  })

  it('after first update, with no update, empty array is returned', () => {
    const c = new Wallet()
    const msgs = c.getMessages(getWalletState1())
    const parsed = [
      [ 'exchange', 'USD', '1000.0', '0', null ],
      [ 'exchange', 'BTC', '1000.0', '0', null ]
    ]

    assert.deepStrictEqual(msgs[0], ['0', 'ws', parsed])
    assert.deepStrictEqual(c.getMessages(getWalletState1()), [])
  })

  it('wallet updates, balance', () => {
    const c = new Wallet()
    const msgs = c.getMessages(getWalletState1())
    const parsed = [
      [ 'exchange', 'USD', '1000.0', '0', null ],
      [ 'exchange', 'BTC', '1000.0', '0', null ]
    ]

    assert.deepStrictEqual(msgs[0], ['0', 'ws', parsed])
    const wu = c.getMessages(getWalletState2())

    const newBal = ['0', 'wu', [ 'exchange', 'USD', '500.0', '0', null ]]
    assert.deepStrictEqual(wu[0], newBal)
  })

  it('wallet updates, new entry', () => {
    const c = new Wallet()
    c.getMessages(getWalletState1())
    const state = getWalletState1()

    state['exchange-EOS'] = {
      user_id: 2,
      name: 'exchange',
      wallettype: 'exchange',
      currency: 'EOS',
      balance: '133.0',
      unsettled_interest: '0'
    }

    const wu = c.getMessages(state)
    const newBal = ['0', 'wu', [ 'exchange', 'EOS', '133.0', '0', null ]]
    assert.deepStrictEqual(wu[0], newBal)
  })
})

function getWalletState1 () {
  return {
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
}

function getWalletState2 () {
  return {
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
}
