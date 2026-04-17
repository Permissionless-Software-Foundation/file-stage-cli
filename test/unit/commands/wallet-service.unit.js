/*
Unit tests for wallet-service command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import WalletService from '../../../src/commands/wallet-service.js'

describe('#wallet-service', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new WalletService()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'getBCHServiceInfo').resolves({ selectedServiceProvider: 'bch provider id' })
      sandbox.stub(uut, 'getIPFSServiceInfo').resolves({ selectedIpfsFileProvider: 'ipfs provider id' })
      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should throw an error if bch provider cannot be obtained!', async () => {
      sandbox.stub(uut, 'getBCHServiceInfo').throws(new Error('test error'))
      const result = await uut.run()

      assert.equal(result, 0)
    })

    it('should throw an error if ipfs provider cannot be obtained!', async () => {
      sandbox.stub(uut, 'getBCHServiceInfo').resolves({ selectedServiceProvider: 'bch provider id' })
      sandbox.stub(uut, 'getIPFSServiceInfo').throws(new Error('test error'))
      const result = await uut.run()

      assert.equal(result, 0)
    })
  })

  describe('#getBCHServiceInfo', () => {
    it('should get provider info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({ data: { selectedServiceProvider: 'bch provider id' } })

      const result = await uut.getBCHServiceInfo()

      assert.isObject(result, 'Expected result to be an object')
      assert.isString(result.selectedServiceProvider, 'Expected provider info to be a string')
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getBCHServiceInfo()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })
  })

  describe('#getIPFSServiceInfo', () => {
    it('should get provider info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({ data: { selectedIpfsFileProvider: 'ipfs provider id' } })

      const result = await uut.getIPFSServiceInfo()

      assert.isObject(result, 'Expected result to be an object')
      assert.isString(result.selectedIpfsFileProvider, 'Expected provider info to be a string')
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getIPFSServiceInfo()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })
  })
})
