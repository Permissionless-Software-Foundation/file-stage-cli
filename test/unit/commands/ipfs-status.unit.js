/*
Unit tests for ipfs-status command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSStatus from '../../../src/commands/ipfs-status.js'

describe('#ipfs-status', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSStatus()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'getNodeStatus').resolves({ ok: true })
      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'getNodeStatus').throws(new Error('test error'))
      const result = await uut.run()

      assert.equal(result, 0)
    })
  })

  describe('#getNodeStatus', () => {
    it('should get node status', async () => {
      sandbox.stub(uut.axios, 'get').resolves({ data: { status: 'ok' } })

      const result = await uut.getNodeStatus()

      assert.equal(result, 'ok')
    })

    it('should handle an error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getNodeStatus()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })
  })
})
