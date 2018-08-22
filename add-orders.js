'use strict'

const { post } = require('./test/helper.js')
const getOrder = require('./example-order.js')

;(async function () {
  const o1 = getOrder({
    user_id: 1,
    postOnly: 0,
    id: 3016984579,
    type: 'EXCHANGE LIMIT',
    amount: '-1',
    price: '17.1',
    pair: 'BTCUSD'
  })

  console.log(await post(['insert_order', o1]))
})()
