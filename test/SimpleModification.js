import { advanceBlock } from './helpers/advanceToBlock'
import { increaseTimeTo, duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import padBytes from './helpers/padBytes'

const standardTokennBehavior = require('./behaviors/StandardToken.js')
const modificationBehavior = require('./behaviors/GenericModification.js')
const SMod = artifacts.require('./test/SimpleModificiatonTest.sol')
const votingWindow = 4000
const supply = 100000000
const payloads = ['0x4b', '0x2D', '0x23']

contract('Simple Modification', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.token = await SMod.new(votingWindow, supply, {from: accounts[0]})
    this.mods = [
      [web3.sha3('mint(address,uint256)').slice(0, 10), [padBytes(accounts[1],
        32), padBytes(payloads[0], 32)]],
      [web3.sha3('mint(address,uint256)').slice(0, 10), [padBytes(accounts[2],
        32), padBytes(payloads[1], 32)]],
      [web3.sha3('burn(address,uint256)').slice(0, 10), [padBytes(accounts[0],
        32), padBytes(payloads[2], 32)]]
    ]
  })
  describe('Creation', function () {
    it('increments modification ids', async function () {
      for (var i = 0; i < this.mods.length; i++) {
        await this.token.createModification(...this.mods[i])
        let ModStruct = await this.token.modifications(i)
        assert.equal(ModStruct[0], this.mods[i][0])
        assert.equal(ModStruct[1].toNumber(), votingWindow + latestTime())
        assert(!ModStruct[2])
      }
    })
    it('correctly initializes window end', async function () {
      await this.token.createModification(...this.mods[0])
      let ModStruct = await this.token.modifications(0)
      assert.equal(ModStruct[1].toNumber(), votingWindow + latestTime())

      await increaseTimeTo(this.midTime)
      await this.token.createModification(...this.mods[1])
      ModStruct = await this.token.modifications(1)
      assert.equal(ModStruct[1].toNumber(), votingWindow + latestTime())
    })
  })
  modificationBehavior(payloads, votingWindow, supply, accounts)
  standardTokennBehavior(supply, accounts[0], accounts[1], accounts[2],
    accounts[3])
})
