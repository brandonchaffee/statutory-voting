import { advanceBlock } from './helpers/advanceToBlock'
import { duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.js')
const shouldBehaveLikeVoting = require('./behaviors/Voting.js')
const BVoting = artifacts.require('./BasicVoting.sol')
const votingWindow = 4000
const supply = 100000000
const targets = [
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733d',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733e'
]

contract('Basic Voting', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.token = await BVoting.new(votingWindow, supply, {from: accounts[0]})
  })
  shouldBehaveLikeVoting(targets, votingWindow, supply, accounts)
  shouldBehaveLikeStandardToken(supply, accounts[0], accounts[1], accounts[2],
    accounts[3])
})
