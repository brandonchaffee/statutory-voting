import assertRevert from './helpers/assertRevert'
import { advanceBlock } from './helpers/advanceToBlock'
import { duration, increaseTimeTo } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import padBytes from './helpers/padBytes'

const EndlessThresholdTest = artifacts.require('EndlessThresholdTest')
const WindowedThresholdTest = artifacts.require('WindowedThresholdTest')
const WindowedRatioTest = artifacts.require('WindowedRatioTest')
const WindowedMajorityTest = artifacts.require('WindowedMajorityTest')
const supply = 500
const votingWindow = 1000
const threshold = 300
const ratioNumerator = 1000
const ratioDenominator = 1500
const details = [
  '0x027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b37',
  '0x027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b38',
  '0x027e57bcbae76c4b6a1c5ce589be41232498f1af86e1b1a2fc2bdffd740e9b39'
]
const payloads = ['0x4b', '0x2D', '0x23']

contract('Approval Types', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.mods = [
      [web3.sha3('mint(address,uint256)').slice(0, 10), [padBytes(accounts[1],
        32), padBytes(payloads[0], 32)], details[0]],
      [web3.sha3('mint(address,uint256)').slice(0, 10), [padBytes(accounts[2],
        32), padBytes(payloads[1], 32)], details[1]],
      [web3.sha3('burn(address,uint256)').slice(0, 10), [padBytes(accounts[0],
        32), padBytes(payloads[2], 32)], details[2]]
    ]
  })
  describe('Endless Threshold', function () {
    beforeEach(async function () {
      this.token = await EndlessThresholdTest.new(supply, threshold)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createModification(...this.mods[0])
    })
    it('reverts if threshold is not met', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, false, {from: accounts[2]})
      await this.token.voteOnModification(0, true, {from: accounts[3]})
      const MStruct = await this.token.modifications(0)
      assert(MStruct[3] < threshold)
      await assertRevert(this.token.confirmModification(0))
    })
    it('validates once thresholds has been met', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      await this.token.voteOnModification(0, false, {from: accounts[3]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] >= threshold)
      await this.token.confirmModification(0)
      MStruct = await this.token.modifications(0)
      assert(MStruct[5])
    })
  })
  describe('Windowed Threshold', function () {
    beforeEach(async function () {
      this.token = await WindowedThresholdTest.new(supply, votingWindow,
        threshold)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createModification(...this.mods[0])
    })
    it('reverts vote outside window', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      increaseTimeTo(this.endTime)
      await assertRevert(this.token.voteOnModification(0, true,
        {from: accounts[3]}))
    })
    it('reverts confirmation inisde window', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] >= threshold)
      increaseTimeTo(this.midTime)
      await assertRevert(this.token.confirmModification(0))
    })
    it('reverts if threshold is not met', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, false, {from: accounts[2]})
      await this.token.voteOnModification(0, true, {from: accounts[3]})
      const MStruct = await this.token.modifications(0)
      assert(MStruct[3] < threshold)

      increaseTimeTo(this.endTime)
      await assertRevert(this.token.confirmModification(0))
    })
    it('validates once thresholds has been met', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      await this.token.voteOnModification(0, false, {from: accounts[3]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] >= threshold)

      increaseTimeTo(this.endTime)
      await this.token.confirmModification(0)
      MStruct = await this.token.modifications(0)
      assert(MStruct[5])
    })
  })
  describe('Windowed Ratio', function () {
    beforeEach(async function () {
      this.token = await WindowedRatioTest.new(supply, votingWindow,
        ratioNumerator, ratioDenominator)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createModification(...this.mods[0])
    })
    it('reverts vote outside window', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      increaseTimeTo(this.endTime)
      await assertRevert(this.token.voteOnModification(0, true,
        {from: accounts[3]}))
    })
    it('reverts confirmation inisde window', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] * ratioNumerator > MStruct[4] * ratioDenominator)
      increaseTimeTo(this.midTime)
      await assertRevert(this.token.confirmModification(0))
    })
    it('reverts if ratio is not exceeded', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, false, {from: accounts[2]})
      await this.token.voteOnModification(0, false, {from: accounts[3]})
      const MStruct = await this.token.modifications(0)
      assert(MStruct[3] * ratioNumerator < MStruct[4] * ratioDenominator)
      await assertRevert(this.token.confirmModification(0))
    })
    it('validates once ratio has been exceeded', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] * ratioNumerator > MStruct[4] * ratioDenominator)
      increaseTimeTo(this.endTime)

      await this.token.confirmModification(0)
      MStruct = await this.token.modifications(0)
      assert(MStruct[5])
    })
  })
  describe('Windowed Majority', function () {
    beforeEach(async function () {
      this.token = await WindowedMajorityTest.new(supply, votingWindow)
      await this.token.transfer(accounts[1], 200, {from: accounts[0]})
      await this.token.transfer(accounts[2], 100, {from: accounts[0]})
      await this.token.transfer(accounts[3], 50, {from: accounts[0]})
      await this.token.createModification(...this.mods[0])
    })
    it('reverts vote outside window', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      increaseTimeTo(this.endTime)
      await assertRevert(this.token.voteOnModification(0, true,
        {from: accounts[3]}))
    })
    it('reverts confirmation inisde window', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, false, {from: accounts[2]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] > MStruct[4])
      increaseTimeTo(this.midTime)
      await assertRevert(this.token.confirmModification(0))
    })
    it('reverts if not in majority', async function () {
      await this.token.voteOnModification(0, false, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      await this.token.voteOnModification(0, true, {from: accounts[3]})
      const MStruct = await this.token.modifications(0)
      assert(MStruct[3] < MStruct[4])
      await assertRevert(this.token.confirmModification(0))
    })
    it('validates once in majority', async function () {
      await this.token.voteOnModification(0, true, {from: accounts[1]})
      await this.token.voteOnModification(0, true, {from: accounts[2]})
      let MStruct = await this.token.modifications(0)
      assert(MStruct[3] > MStruct[4])
      increaseTimeTo(this.endTime)

      await this.token.confirmModification(0)
      MStruct = await this.token.modifications(0)
      assert(MStruct[5])
    })
  })
})
