var SimpleProposal = artifacts.require('./SimpleProposal.sol')
var DetailedProposal = artifacts.require('./DetailedProposal.sol')

module.exports = function (deployer) {
  const votingWindow = 4000
  const supply = 100000000
  deployer.deploy(SimpleProposal, votingWindow, supply)
  deployer.deploy(DetailedProposal, votingWindow, supply)
}
