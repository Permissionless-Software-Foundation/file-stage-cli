/*
Unit tests for consumer-test command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import ConsumerTest from '../../../src/commands/consumer-test.js'

describe('#consumer-test', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new ConsumerTest()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run()', () => {
    it('should execute the run function successfully', async () => {
      sandbox.stub(uut, 'getConsumerServices').resolves(['http://localhost:5005'])
      sandbox.stub(uut, 'getBCHServiceInfo').resolves('bch-service-1')
      sandbox.stub(uut, 'getIPFSServiceInfo').resolves('ipfs-service-1')
      sandbox.stub(uut, 'getBalance').resolves({ balance: 1000, tokens: [] })
      sandbox.stub(uut, 'getFileInfo').resolves({ dataPinned: true })

      const result = await uut.run({})

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'getConsumerServices').throws(new Error('test error'))

      const result = await uut.run({})

      assert.equal(result, 0)
    })
  })

  describe('#getConsumerServices()', () => {
    it('should return an array of server URLs', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          servers: [
            { value: 'http://server1.com' },
            { value: 'http://server2.com' }
          ]
        }
      })

      const result = await uut.getConsumerServices({})

      assert.isArray(result)
      assert.equal(result.length, 2)
      assert.equal(result[0], 'http://server1.com')
      assert.equal(result[1], 'http://server2.com')
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getConsumerServices({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#getBCHServiceInfo()', () => {
    it('should return BCH service info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: { selectedServiceProvider: 'bch-service-1' }
      })

      const result = await uut.getBCHServiceInfo({ serverUrl: 'http://localhost:5005' })

      assert.equal(result, 'bch-service-1')
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getBCHServiceInfo({ serverUrl: 'http://localhost:5005' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#getIPFSServiceInfo()', () => {
    it('should return IPFS service info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: { selectedIpfsFileProvider: 'ipfs-service-1' }
      })

      const result = await uut.getIPFSServiceInfo({ serverUrl: 'http://localhost:5005' })

      assert.equal(result, 'ipfs-service-1')
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getIPFSServiceInfo({ serverUrl: 'http://localhost:5005' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#getFileInfo()', () => {
    it('should return file info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          success: true,
          fileMetadata: {
            cid: 'bafkreibhlm5pbob67r2hfxe5yacisamnt7gjcsiutleqq5aabeg4kohcaa',
            dataPinned: true
          }
        }
      })

      const result = await uut.getFileInfo({
        serverUrl: 'http://localhost:5005',
        cid: 'bafkreibhlm5pbob67r2hfxe5yacisamnt7gjcsiutleqq5aabeg4kohcaa'
      })

      assert.property(result, 'cid')
      assert.property(result, 'dataPinned')
    })

    it('should throw error if success is false', async () => {
      try {
        sandbox.stub(uut.axios, 'get').resolves({
          data: { success: false, message: 'not found' }
        })

        await uut.getFileInfo({
          serverUrl: 'http://localhost:5005',
          cid: 'test-cid'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'not found')
      }
    })

    it('should throw error if fileMetadata is missing cid', async () => {
      try {
        sandbox.stub(uut.axios, 'get').resolves({
          data: {
            success: true,
            fileMetadata: {}
          }
        })

        await uut.getFileInfo({
          serverUrl: 'http://localhost:5005',
          cid: 'test-cid'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'not found')
      }
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getFileInfo({
          serverUrl: 'http://localhost:5005',
          cid: 'test-cid'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })
})
