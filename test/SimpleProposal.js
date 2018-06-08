import { advanceBlock } from './helpers/advanceToBlock'
import { increaseTimeTo, duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.js')
const shouldBehaveLikeProposal = require('./behaviors/GenericProposal.js')
const SProposal = artifacts.require('./test/SimpleProposalTest.sol')
const votingWindow = 4000
const supply = 100000000
const targets = [
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733d',
  '0xca35b7d915458ef540ade6068dfe2f44e8fa733e'
]
const payload = [
  [targets[0]],
  [targets[1]],
  [targets[2]]
]

contract('Simple Proposal', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.token = await SProposal.new(votingWindow, supply, {from: accounts[0]})
  })
  describe('Proposing', function () {
    it('increments proposal ids', async function () {
      for (var i = 0; i < targets.length; i++) {
        await this.token.createProposal(targets[i])
        let ProposalStruct = await this.token.proposals(i)
        assert.equal(ProposalStruct[0], targets[i])
        assert.equal(ProposalStruct[1].toNumber(), votingWindow +
                  latestTime())
        assert(!ProposalStruct[2])
      }
    })
    it('correctly initializes window end', async function () {
      await this.token.createProposal(targets[0])
      let ProposalStruct = await this.token.proposals(0)
      assert.equal(ProposalStruct[1].toNumber(), votingWindow + latestTime())

      await increaseTimeTo(this.midTime)
      await this.token.createProposal(targets[1])
      ProposalStruct = await this.token.proposals(1)
      assert.equal(ProposalStruct[1].toNumber(), votingWindow + latestTime())
    })
    it('emits regular event', async function () {

    })
  })
  shouldBehaveLikeProposal(payload, votingWindow, supply, accounts)
  shouldBehaveLikeStandardToken(supply, accounts[0], accounts[1], accounts[2],
    accounts[3])
})
