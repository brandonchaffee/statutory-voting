import assertRevert from '../helpers/assertRevert'
import { increaseTimeTo, duration } from '../helpers/increaseTime'
import latestTime from '../helpers/latestTime'

function modificationBehavior (payloads, votingWindow, supply, accounts) {
  describe('Generic Modification', function () {
    beforeEach(async function () {
      await this.token.createModification(...this.mods[0])
    })
    describe('Voting', function () {
      beforeEach(async function () {
        await this.token.transfer(accounts[1], 450, {from: accounts[0]})
        await this.token.transfer(accounts[2], 250, {from: accounts[0]})
        await this.token.transfer(accounts[3], 250, {from: accounts[0]})
      })
      it('increments votes by balance', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        await this.token.voteOnModification(0, false, {from: accounts[2]})

        const balanceA = await this.token.balanceOf(accounts[1])
        const balanceB = await this.token.balanceOf(accounts[2])
        const ModStruct = await this.token.modifications(0)

        assert.equal(balanceA.toNumber(), ModStruct[3].toNumber())
        assert.equal(balanceB.toNumber(), ModStruct[4].toNumber())
      })
      it('modifies validity with majority', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        let ModStruct = await this.token.modifications(0)
        assert(ModStruct[2])

        await this.token.voteOnModification(0, false, {from: accounts[2]})
        await this.token.voteOnModification(0, false, {from: accounts[3]})
        ModStruct = await this.token.modifications(0)
        assert(!ModStruct[2])
      })
      it('decrements prior vote on sign switch', async function () {
        const balance = await this.token.balanceOf(accounts[1])
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        let ModStruct = await this.token.modifications(0)
        assert.equal(balance.toNumber(), ModStruct[3].toNumber())

        await this.token.voteOnModification(0, false, {from: accounts[1]})
        ModStruct = await this.token.modifications(0)
        assert.equal(balance.toNumber(), ModStruct[4].toNumber())
        assert.equal(ModStruct[3].toNumber(), 0)
      })
      it('does not double count vote', async function () {
        const balance = await this.token.balanceOf(accounts[1])
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        let ModStruct = await this.token.modifications(0)
        assert.equal(balance.toNumber(), ModStruct[3].toNumber())
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        ModStruct = await this.token.modifications(0)
        assert.equal(balance.toNumber(), ModStruct[3].toNumber())
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        ModStruct = await this.token.modifications(0)
        assert.equal(balance.toNumber(), ModStruct[3].toNumber())
      })
      it('reverts outside of voting winodw', async function () {
        await increaseTimeTo(this.endTime)
        await assertRevert(this.token.voteOnModification(0, true,
          {from: accounts[1]}))
      })
    })
    describe('Transfer Block', function () {
      beforeEach(async function () {
        await this.token.transfer(accounts[1], 200, {from: accounts[0]})
        await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      })
      it('reverts on transfer after voting', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        await assertRevert(this.token.transfer(accounts[2], 50,
          {from: accounts[1]}))
      })
      it('reverts on transferFrom after voting', async function () {
        await this.token.approve(accounts[4], 100, {from: accounts[1]})

        await this.token.voteOnModification(0, true, {from: accounts[1]})
        await assertRevert(this.token.transferFrom(accounts[1], accounts[2],
          50, {from: accounts[1]}))
      })
      it('decrements votes when unblocked', async function () {
        const balance = await this.token.balanceOf(accounts[1])

        await this.token.createModification(...this.mods[1])
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        await this.token.voteOnModification(1, false, {from: accounts[1]})
        let ProposalOne = await this.token.modifications(0)
        let ProposalTwo = await this.token.modifications(1)
        assert.equal(ProposalOne[3].toNumber(), balance)
        assert.equal(ProposalTwo[4].toNumber(), balance)

        await this.token.unblockTransfer({from: accounts[1]})
        ProposalOne = await this.token.modifications(0)
        ProposalTwo = await this.token.modifications(1)
        assert.equal(ProposalOne[3].toNumber(), 0)
        assert.equal(ProposalTwo[4].toNumber(), 0)
      })
      it('reallows transfer after unblock', async function () {
        const amount = 30
        const preBalance = await this.token.balanceOf(accounts[1])

        await this.token.voteOnModification(0, true, {from: accounts[1]})
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
        await this.token.createModification(...this.mods[1])
        await this.token.transfer(accounts[1], 200, {from: accounts[0]})
        await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      })
      it('sets previously approved value', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmModifications(0)
        const Proposal = await this.token.modifications(0)
        assert(Proposal[5])
      })
      it('reverts until outside voting window', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        await assertRevert(this.token.confirmModifications(0))
        increaseTimeTo(this.midTime)
        await assertRevert(this.token.confirmModifications(0))
        increaseTimeTo(this.endTime)
        await this.token.confirmModifications(0)
      })
      it('revets if proposal is invalid', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[2]})
        await this.token.voteOnModification(0, false, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await assertRevert(this.token.confirmModifications(0))
      })
      it('reverts on reconfirmation', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmModifications(0)
        await assertRevert(this.token.confirmModifications(0))
      })
      it('old approved proposal cannot be reconfirmed', async function () {
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmModifications(0)
        await this.token.unblockTransfer({from: accounts[1]})

        await this.token.createModification(...this.mods[2])
        await this.token.voteOnModification(2, true, {from: accounts[1]})
        increaseTimeTo(latestTime() + duration.days(1))
        await this.token.confirmModifications(2)
        await assertRevert(this.token.confirmModifications(0))
      })
    })
    describe('Modifying', function () {
      beforeEach(async function () {
        await this.token.transfer(accounts[1], 200, {from: accounts[0]})
        await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      })
      it('changes state correctly', async function () {
        const preBalance = await this.token.balanceOf(accounts[1])
        await this.token.voteOnModification(0, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)
        await this.token.confirmModifications(0)
        const postBalance = await this.token.balanceOf(accounts[1])
        assert.equal(preBalance.toNumber() + parseInt(payloads[0]),
          postBalance.toNumber())
      })
      it('delegates to proper function', async function () {
        await this.token.createModification(...this.mods[1])
        await this.token.createModification(...this.mods[2])
        const initialSupply = await this.token.totalSupply()

        await this.token.voteOnModification(1, true, {from: accounts[1]})
        await this.token.voteOnModification(2, true, {from: accounts[1]})
        increaseTimeTo(this.endTime)

        await this.token.confirmModifications(1)
        const midSupply = await this.token.totalSupply()
        assert.equal(midSupply.toNumber(), initialSupply.toNumber() +
          parseInt(payloads[1]))

        await this.token.confirmModifications(2)
        const endSupply = await this.token.totalSupply()
        assert.equal(endSupply.toNumber(), midSupply.toNumber() -
          parseInt(payloads[2]))
      })
    })
  })
}

module.exports = modificationBehavior
