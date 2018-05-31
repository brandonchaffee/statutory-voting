import { advanceBlock } from './helpers/advanceToBlock'
import { increaseTimeTo, duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.js')
const shouldBehaveLikeGeneric = require('./behaviors/GenericProposal.js')
const DProposal = artifacts.require('./DetailedProposal.sol')
const votingWindow = 4000
const supply = 100000000
const targets = [
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733d',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733e'
]
const details = [
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b37',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b38',
  '027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b39'
]
const payload = [
  [targets[0], details[0]],
  [targets[1], details[1]],
  [targets[2], details[2]]
]

contract('Detailed Proposal', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.token = await DProposal.new(votingWindow, supply, {from: accounts[0]})
  })
  describe('Proposing', function () {
    it('increments proposal ids', async function () {
      for (var i = 0; i < targets.length; i++) {
        await this.token.createProposal(...payload[i])
        let ProposalStruct = await this.token.proposals(i)
        assert.equal(ProposalStruct[0], targets[i])
        assert.equal(ProposalStruct[1].toNumber(), votingWindow +
                  latestTime())
        assert(!ProposalStruct[2])
      }
    })
    it('correctly initializes window end', async function () {
      await this.token.createProposal(...payload[0])
      let ProposalStruct = await this.token.proposals(0)
      assert.equal(ProposalStruct[1].toNumber(), votingWindow +
                latestTime())

      await increaseTimeTo(this.midTime)
      await this.token.createProposal(...payload[1])
      ProposalStruct = await this.token.proposals(1)
      assert.equal(ProposalStruct[1].toNumber(), votingWindow +
                latestTime())
    })
    it('emits details', async function () {

    })
  })
  shouldBehaveLikeGeneric(payload, votingWindow, supply, accounts)
  shouldBehaveLikeStandardToken(supply, accounts[0], accounts[1], accounts[2],
    accounts[3])
})
