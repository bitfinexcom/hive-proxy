'use strict'

const conf = require('./config/http.conf.json')

console.log(`starting http server, port: ${conf.port}`)

const proxy = require('./lib/proxy-http.js')
proxy.listen(conf)
