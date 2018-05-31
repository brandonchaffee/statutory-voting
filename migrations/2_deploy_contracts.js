var BasicVoting = artifacts.require('./BasicVoting.sol')

module.exports = function (deployer) {
  const votingWindow = 4000
  const supply = 100000000
  deployer.deploy(BasicVoting, votingWindow, supply)
}
