'use strict'

const getOrder = require('./example-order.js')
const setup = require('./test/setup-engine.js')
const { post } = require('./test/helper.js')

;(async function () {
  await setup()

  const o1 = getOrder({
    user_id: 1,
    postOnly: 0,
    id: 9805964569,
    type: 'EXCHANGE LIMIT',
    amount: '-3',
    price: '12.12',
    pair: 'BTCUSD'
  })

  const o2 = getOrder({
    user_id: 2,
    postOnly: 0,
    id: 9805964570,
    type: 'EXCHANGE LIMIT',
    amount: '3',
    price: '12.12',
    pair: 'BTCUSD'
  })

  const o3 = getOrder({
    user_id: 2,
    postOnly: 0,
    id: 9805964600,
    type: 'EXCHANGE LIMIT',
    amount: '-3',
    price: '12.13',
    pair: 'BTCUSD'
  })

  await post(['insert_order', o1])
  await post(['insert_order', o2])

  setTimeout(async () => {
    const wallet1 = await post(['get_wallet', [1, 'exchange']])
    const wallet2 = await post(['get_wallet', [2, 'exchange']])

    console.log(wallet1)
    console.log(wallet2)

    o1.id = 9805964571
    await post(['insert_order', o1])

    o2.id = 9805964572
    o2.price = '9.99'
    await post(['insert_order', o2])

    o2.id = 9805964573
    o2.price = '8.99'
    await post(['insert_order', o2])

    o2.id = 9805964574
    await post(['insert_order', o2])

    await post(['insert_order', o3])

    setTimeout(async () => {
      console.log(await post(['get_book_depth', 'BTCUSD']))
    }, 250)
  }, 5000)
})()
