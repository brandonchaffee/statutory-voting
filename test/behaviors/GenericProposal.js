import assertRevert from '../helpers/assertRevert'
import { increaseTimeTo, duration } from '../helpers/increaseTime'
import latestTime from '../helpers/latestTime'

function genericProposalBehavior (payload, votingWindow, supply, accounts) {
  describe('Generic Proposal', function () {
    beforeEach(async function () {
      await this.token.createProposal(...payload[0])
    })

    describe('Voting', function () {
      beforeEach(async function () {
        await this.token.transfer(accounts[1], 450, {from: accounts[0]})
        await this.token.transfer(accounts[2], 250, {from: accounts[0]})
        await this.token.transfer(accounts[3], 250, {from: accounts[0]})
      })
      it('increments votes by balance', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await this.token.voteOnProposal(0, false, {from: accounts[2]})

        const balanceA = await this.token.balanceOf(accounts[1])
        const balanceB = await this.token.balanceOf(accounts[2])
        const ProposalStruct = await this.token.proposals(0)

        assert.equal(balanceA.toNumber(), ProposalStruct[3].toNumber())
        assert.equal(balanceB.toNumber(), ProposalStruct[4].toNumber())
      })
      it('modifies validity with majority', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        let ProposalStruct = await this.token.proposals(0)
        assert(ProposalStruct[2])

        await this.token.voteOnProposal(0, false, {from: accounts[2]})
        await this.token.voteOnProposal(0, false, {from: accounts[3]})
        ProposalStruct = await this.token.proposals(0)
        assert(!ProposalStruct[2])
      })
      it('decrements prior vote on sign switch', async function () {
        const balance = await this.token.balanceOf(accounts[1])
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        let ProposalStruct = await this.token.proposals(0)
        assert.equal(balance.toNumber(), ProposalStruct[3].toNumber())

        await this.token.voteOnProposal(0, false, {from: accounts[1]})
        ProposalStruct = await this.token.proposals(0)
        assert.equal(balance.toNumber(), ProposalStruct[4].toNumber())
        assert.equal(ProposalStruct[3].toNumber(), 0)
      })
      it('does not double count vote', async function () {
        const balance = await this.token.balanceOf(accounts[1])
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        let ProposalStruct = await this.token.proposals(0)
        assert.equal(balance.toNumber(), ProposalStruct[3].toNumber())
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        ProposalStruct = await this.token.proposals(0)
        assert.equal(balance.toNumber(), ProposalStruct[3].toNumber())
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        ProposalStruct = await this.token.proposals(0)
        assert.equal(balance.toNumber(), ProposalStruct[3].toNumber())
      })
      it('reverts outside of voting winodw', async function () {
        await increaseTimeTo(this.endTime)
        await assertRevert(this.token.voteOnProposal(0, true,
          {from: accounts[1]}))
      })
    })
    describe('Transfer Block', function () {
      beforeEach(async function () {
        await this.token.transfer(accounts[1], 200, {from: accounts[0]})
        await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      })
      it('reverts on transfer after voting', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await assertRevert(this.token.transfer(accounts[2], 50,
          {from: accounts[1]}))
      })
      it('reverts on transferFrom after voting', async function () {
        await this.token.approve(accounts[4], 100, {from: accounts[1]})

        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await assertRevert(this.token.transferFrom(accounts[1], accounts[2],
          50, {from: accounts[1]}))
      })
      it('decrements votes when unblocked', async function () {
        const balance = await this.token.balanceOf(accounts[1])

        await this.token.createProposal(...payload[1])
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await this.token.voteOnProposal(1, false, {from: accounts[1]})
        let ProposalOne = await this.token.proposals(0)
        let ProposalTwo = await this.token.proposals(1)
        assert.equal(ProposalOne[3].toNumber(), balance)
        assert.equal(ProposalTwo[4].toNumber(), balance)

        await this.token.unblockTransfer({from: accounts[1]})
        ProposalOne = await this.token.proposals(0)
        ProposalTwo = await this.token.proposals(1)
        assert.equal(ProposalOne[3].toNumber(), 0)
        assert.equal(ProposalTwo[4].toNumber(), 0)
      })
      it('reallows transfer after unblock', async function () {
        const amount = 30
        const preBalance = await this.token.balanceOf(accounts[1])

        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await assertRevert(this.token.transfer(accounts[2], amount,
          {from: accounts[1]}))
        await this.token.unblockTransfer({from: accounts[1]})
        await this.token.transfer(accounts[2], amount, {from: accounts[1]})
        const postBalance = await this.token.balanceOf(accounts[1])
        assert.equal(postBalance.toNumber(), preBalance.toNumber() - amount)
      })
    })
    describe('Confirmation', function () {
      beforeEach(async function () {
        await this.token.createProposal(...payload[1])
        await this.token.transfer(accounts[1], 200, {from: accounts[0]})
        await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      })
      it('sets previously approved value', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
        const Proposal = await this.token.proposals(0)
        assert(Proposal[5])
      })
      it('reverts until outside voting window', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        await assertRevert(this.token.confirmProposal(0))
        increaseTimeTo(this.midTime)
        await assertRevert(this.token.confirmProposal(0))
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
      })
      it('revets if proposal is invalid', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[2]})
        await this.token.voteOnProposal(0, false, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await assertRevert(this.token.confirmProposal(0))
      })
      it('reverts on reconfirmation', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmProposal(0)
        await assertRevert(this.token.confirmProposal(0))
      })
      it('old approved proposal cannot be reconfirmed', async function () {
        await this.token.voteOnProposal(0, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmProposal(0)
        await this.token.unblockTransfer({from: accounts[1]})

        await this.token.createProposal(...payload[2])
        await this.token.voteOnProposal(2, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmProposal(2)
        await assertRevert(this.token.confirmProposal(0))
      })
    })
  })
}

module.exports = genericProposalBehavior
