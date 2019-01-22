'use strict'

const request = require('request')

const getOrder = require('./example-order.js')
const setup = require('./test/setup-engine.js')

const URL = 'http://localhost:8000'

;(async function () {
  await setup()

  const res = await req('get', '/v2/book/BTCUSD/P0')
  console.log(res)
})()

function req (method, uri, body) {
  return new Promise((resolve) => {
    const opts = {
      uri: `${URL}${uri}`,
      json: true
    }

    if (body) opts.body = body

    request[method](opts, (err, res, body) => {
      if (err) throw err

      resolve(body)
    })
  })
}
