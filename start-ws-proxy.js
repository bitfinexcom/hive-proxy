'use strict'

const ProxyWs = require('./lib/proxy-ws.js')

const { pairs, port, endpoint } = require('./config/ws.conf.json')

console.log(`starting ws server with pairs: ${pairs.join(', ')} - port: ${port}`)

const p = new ProxyWs({
  ws: {
    port: port,
    clientTracking: true
  },
  pairs: pairs,
  endpoint: endpoint,
  authPlugin: null
})

module.exports = p
