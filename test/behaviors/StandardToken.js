import assertRevert from '../helpers/assertRevert'

function standardTokennBehavior (
  supply, owner, recipient, spender, nonspender
) {
  describe('Balance Transfer', function () {
    it('owner has balance of total supply', async function () {
      const ownerBalance = await this.token.balanceOf(owner)
      assert.equal(ownerBalance, supply)
    })
    it('recipient has zero balance', async function () {
      const recipientBalance = await this.token.balanceOf(recipient)
      assert.equal(recipientBalance, 0)
    })
    it('recipient received balance from owner', async function () {
      const transferValue = 100
      const oBefore = await this.token.balanceOf(owner)
      const rBefore = await this.token.balanceOf(recipient)

      await this.token.transfer(recipient, transferValue, {from: owner})

      const oAfter = await this.token.balanceOf(owner)
      const rAfter = await this.token.balanceOf(recipient)

      assert.equal(oAfter.toNumber(), oBefore.toNumber() - transferValue,
        'Owner balance incorrect')
      assert.equal(rAfter.toNumber(), rBefore.toNumber() + transferValue,
        'Recipient balance incorrect')
    })
    it('reverts without sufficient balance', async function () {
      const transferValue = 200
      await assertRevert(this.token.transfer(owner, transferValue,
        {from: recipient}))
    })
  })
  describe('Approval', function () {
    it('has correct allowance', async function () {
      const approvalAmount = 500
      await this.token.approve(spender, approvalAmount, {from: owner})
      const allowanceAmount = await this.token.allowance(owner, spender)
      assert.equal(approvalAmount, allowanceAmount)
    })
    it('allows transfer from spender', async function () {
      const approvalAmount = 500
      await this.token.approve(spender, approvalAmount, {from: owner})

      const transferValue = 250
      const oBefore = await this.token.balanceOf(owner)
      const rBefore = await this.token.balanceOf(recipient)

      await this.token.transferFrom(owner, recipient, transferValue,
        {from: spender})

      const oAfter = await this.token.balanceOf(owner)
      const rAfter = await this.token.balanceOf(recipient)
      assert.equal(oAfter.toNumber(), oBefore.toNumber() - transferValue,
        'Owner balance incorrect')
      assert.equal(rAfter.toNumber(), rBefore.toNumber() + transferValue,
        'Recipient balance incorrect')
    })
    it('reverts transfer from nonspender', async function () {
      const transferValue = 200
      const approvalAmount = 500
      await this.token.approve(spender, approvalAmount, {from: owner})
      assertRevert(this.token.transferFrom(owner, recipient,
        transferValue, {from: nonspender}))
    })
    it('fail until approval increased', async function () {
      const transferValue = 1000
      const initialApproval = 500
      const approvalIncrease = 750
      const rBefore = await this.token.balanceOf(recipient)
      await this.token.approve(spender, initialApproval, {from: owner})
      assertRevert(this.token.transferFrom(owner, recipient,
        transferValue, {from: spender}))
      const rDuring = await this.token.balanceOf(recipient)
      assert.equal(rDuring.toNumber(), rBefore.toNumber())

      await this.token.increaseApproval(spender, approvalIncrease,
        {from: owner})
      await this.token.transferFrom(owner, recipient, transferValue,
        {from: spender})
      const rAfter = await this.token.balanceOf(recipient)

      assert.equal(rAfter.toNumber(), transferValue)
    })
  })
}

module.exports = standardTokennBehavior
