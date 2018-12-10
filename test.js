'use strict'

const uuid = require('uuid/v4')
const Sock = require('./lib/socket.js')

const sock = new Sock({
  gateway: 'tcp://127.0.0.1:4500'
})

function getBook () {
  const reqId = uuid()
  const payload = ['get_book_depth', 'BTCUSD', reqId]
  console.log(payload)
  sock.send(reqId, 'gateway', payload, (err, res) => {
    if (err) {
      console.error(
        `request ${reqId} failed, payload: ${payload}, error:${err}`
      )
      throw err
    }

    console.log(res)

    getBook()
  })
}

function getUserdata () {
  const reqId = uuid()
  const userId = 1

  const payload = ['get_user_data', [+userId], reqId]
  console.log(payload)

  sock.send(reqId, 'gateway', payload, (err, res) => {
    if (err) {
      console.error(
        `request ${reqId} failed, payload: ${payload}, error:${err}`
      )
      throw err
    }

    console.log(res)

    getUserdata()
  })
}

const delay = 1500

for (let i = 0; i < 2; i++) {
  getBook(() => {
    setTimeout(getBook, delay)
  })

  getUserdata(() => {
    setTimeout(getUserdata, delay)
  })
}
