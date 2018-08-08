# hive-proxy - Simple ZMQ connection helper for trading

## http proxy

Start with:

```
node index.js
```

There is an example in [./example-http-proxy.js](./example-http-proxy.js) - this will create two users and submit two matching oders for them. Finally, it will print the updated user wallet balances.


## socket.js

Features of `socket.js`:

 - caches ZMQ sockets
 - adds new sockets on the fly

Example:

```js
const Sock = require('./')

const s = new Sock({
  gateway: 'ipc:///tmp/proxy0'
})

s.send('gateway', ['set_gw_status', {'trigger_tickers': true, 'trigger_liq': true}])

```

See more advanced examples in [./example-socket.js](./example-socket.js)


### API

#### new Socket([endpoints])

Creates new instance


#### send(endpoint, data)

Sends data to a ZMQ endpoint. Serializes JSON.

#### close([endpoint])

Closes all sockets (no argument) or a specfic socket.
