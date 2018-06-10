require('babel-polyfill')
require('babel-register')
require('web3-utils')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    }
  }
}
