const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.js')
var SVoting = artifacts.require("./StatutoryVoting.sol")
const votingWindow = 4000
const supply = 100000000

contract('Statutory Voting', function (accounts) {
  beforeEach(async function () {
    this.token = await SVoting.new(votingWindow, supply, {from:accounts[0]});
  })
  describe('Voting', function(){

  })
  describe('Transfer Lock', function(){

  })
  describe('Proposing', function(){

  })
  shouldBehaveLikeStandardToken(supply, accounts[0], accounts[1], accounts[2],
    accounts[3]);

})
