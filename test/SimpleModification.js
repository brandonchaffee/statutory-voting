import { advanceBlock } from './helpers/advanceToBlock'
import { increaseTimeTo, duration } from './helpers/increaseTime'
import latestTime from './helpers/latestTime'

const standardTokennBehavior = require('./behaviors/StandardToken.js')
const modificationBehavior = require('./behaviors/GenericModification.js')
const SMod = artifacts.require('./test/SimpleModificiatonTest.sol')
const votingWindow = 4000
const supply = 100000000
const targets = [
  ['0xca35b7da', ['0x04', '0x05']],
  ['0xca35b7db', ['0x04', '0x05']],
  ['0xca35b7dc', ['0x04', '0x05']]
]

const payload = [targets[0], targets[1], targets[2]]

contract('Simple Modification', function (accounts) {
  beforeEach(async function () {
    await advanceBlock()
    this.midTime = latestTime() + duration.minutes(10)
    this.endTime = latestTime() + duration.days(1)
    this.token = await SMod.new(votingWindow, supply, {from: accounts[0]})
  })
  describe('Creation', function () {
    it('increments proposal ids', async function () {
      for (var i = 0; i < targets.length; i++) {
        await this.token.createModification(...payload[i])
        let ModStruct = await this.token.modifications(i)
        assert.equal(ModStruct[0], payload[i][0])
        assert.equal(ModStruct[1].toNumber(), votingWindow +
                  latestTime())
        assert(!ModStruct[2])
      }
    })
    it('correctly initializes window end', async function () {
      await this.token.createModification(...payload[0])
      let ModStruct = await this.token.modifications(0)
      assert.equal(ModStruct[1].toNumber(), votingWindow + latestTime())

      await increaseTimeTo(this.midTime)
      await this.token.createModification(...payload[1])
      ModStruct = await this.token.modifications(1)
      assert.equal(ModStruct[1].toNumber(), votingWindow + latestTime())
    })
  })
  modificationBehavior(payload, votingWindow, supply, accounts)
  standardTokennBehavior(supply, accounts[0], accounts[1], accounts[2],
    accounts[3])
})
