/*
Unit tests for ipfs-relays command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSRelays from '../../../src/commands/ipfs-relays.js'

describe('#ipfs-relays', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSRelays()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'getRelays').resolves({ relays: {} })
      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'getRelays').throws(new Error('test error'))
      const result = await uut.run()

      assert.equal(result, 0)
    })
  })

  describe('#getRelays', () => {
    it('should query relays', async () => {
      sandbox.stub(uut.axios, 'post').resolves({ data: { relays: {} } })

      const result = await uut.getRelays()

      assert.isObject(result)
    })

    it('should handle an error', async () => {
      try {
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        await uut.getRelays()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })
  })
})
