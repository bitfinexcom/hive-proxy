'use strict'

const conf = require('./config/http.conf.json')

console.log(`starting http server, port: ${conf.port}`)

const Proxy = require('./lib/proxy-http.js')
const proxy = new Proxy(conf)
proxy.listen()
