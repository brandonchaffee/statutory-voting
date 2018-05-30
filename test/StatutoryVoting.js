var StatutoryVoting = artifacts.require("./StatutoryVoting.sol");
const votingWindow = 4000
const supply = 100000000

console.log("Works")

contract('Statutory Voting', function (accounts) {
  beforeEach(async function () {
    this.svoting = await StatutoryVoting.new(votingWindow, supply);
  })
})
