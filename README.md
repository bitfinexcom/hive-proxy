# hive-proxy - Simple ZMQ connection helper for trading

## http proxy

Start with:

```
node index.js
```

Example in [./example-http-proxy.js](./example-http-proxy.js)


## socket.js

Features of `socket.js`:

 - caches ZMQ sockets
 - adds new sockets on the fly


Example:

```js
const Sock = require('./')

const s = new Sock()
s.send('gateway', ['set_gw_status', {'trigger_tickers': true, 'trigger_liq': true}])

```

See more advanced examples in [./example-socket.js](./example-socket.js)
