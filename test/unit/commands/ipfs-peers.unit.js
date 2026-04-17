/*
Unit tests for ipfs-peers command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSPeers from '../../../src/commands/ipfs-peers.js'

describe('#ipfs-peers', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSPeers()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'getNodePeers').resolves({ peers: [] })
      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'getNodePeers').throws(new Error('test error'))
      const result = await uut.run()

      assert.equal(result, 0)
    })
  })

  describe('#getNodePeers', () => {
    it('should get node peers', async () => {
      sandbox.stub(uut.axios, 'post').resolves({ data: { peers: [] } })

      const result = await uut.getNodePeers()

      assert.isArray(result)
    })

    it('should handle an error', async () => {
      try {
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        await uut.getNodePeers()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })
  })
})
