'use strict'

const request = require('request')

exports.post = post
function post (opts) {
  return new Promise((resolve) => {
    request.post({
      uri: 'http://localhost:8000/gateway',
      json: true,
      body: opts
    }, (err, res, body) => {
      if (err) throw err

      resolve(body)
    })
  })
}
