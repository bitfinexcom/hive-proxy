'use strict'

const { port } = require('./config/http.conf.json')

console.log(`starting http server, port: ${port}`)

const proxy = require('./lib/proxy-http.js')
proxy.listen(port)
