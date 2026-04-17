/*
Unit tests for ipfs-connect command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSConnect from '../../../src/commands/ipfs-connect.js'

describe('#ipfs-connect', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSConnect()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'connect').resolves({ })
      const result = await uut.run({ multiaddr: 'test' })

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'connect').throws(new Error('test error'))
      const result = await uut.run({ multiaddr: 'test' })

      assert.equal(result, 0)
    })
  })

  describe('#connect', () => {
    it('should connecto to address', async () => {
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: true } })

      const result = await uut.connect({ multiaddr: 'test' })

      assert.isObject(result)
      assert.equal(result.success, true)
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        await uut.connect({ multiaddr: 'test' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })
    it('should handle missing input', async () => {
      try {
        await uut.connect()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Cannot read properties of undefined')
      }
    })
  })
  describe('#validateFlags()', () => {
    it('validateFlags() should return true if all arguments are supplied.', () => {
      const flags = {
        multiaddr: 'test123'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if multiaddr is not supplied.', () => {
      try {
        uut.validateFlags({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a multiaddr with the -m flag.',
          'Expected error message.'
        )
      }
    })
  })
})
