/*
Unit tests for unprocessed-pins command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import UnprocessedPins from '../../../src/commands/unprocessed-pins.js'

describe('#unprocessed-pins', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new UnprocessedPins()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('should return true', () => {
      assert.equal(uut.validateFlags({}), true, 'return true')
    })
  })

  describe('#run()', () => {
    it('should execute the run function successfully', async () => {
      sandbox.stub(uut, 'getInfo').resolves([{ cid: 'test-cid' }])

      const result = await uut.run({})

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'getInfo').throws(new Error('test error'))

      const result = await uut.run({})

      assert.equal(result, 0)
    })
  })

  describe('#getInfo()', () => {
    it('should return unprocessed pins data', async () => {
      const mockData = [
        { cid: 'cid1', validClaim: null },
        { cid: 'cid2', validClaim: null }
      ]
      sandbox.stub(uut.axios, 'get').resolves({ data: mockData })

      const result = await uut.getInfo({})

      assert.isArray(result)
      assert.equal(result.length, 2)
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getInfo({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })
})
