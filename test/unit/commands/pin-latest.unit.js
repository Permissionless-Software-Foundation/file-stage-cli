/*
Unit tests for pin-latest command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import PinLatest from '../../../src/commands/pin-latest.js'

describe('#pin-latest', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new PinLatest()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'fetchPins').resolves({ pins: [] })

      const result = await uut.run({ page: '1' })

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'fetchPins').throws(new Error('test error'))
      const result = await uut.run({ page: '1' })

      assert.equal(result, 0)
    })

    it('should return 0 if validation fails', async () => {
      const result = await uut.run({ page: '0' })

      assert.equal(result, 0)
    })
  })

  describe('#fetchPins', () => {
    it('should GET /ipfs/pins/<page> on the stage service', async () => {
      sandbox.stub(uut.axios, 'get').resolves({ data: { ok: true } })

      const result = await uut.fetchPins(2)

      assert.deepEqual(result, { ok: true })
      assert.isTrue(
        uut.axios.get.calledWith(
          `${uut.config.stageService}/ipfs/pins/2`
        )
      )
    })

    it('should propagate axios errors', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('network'))

        await uut.fetchPins(1)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'network')
      }
    })
  })

  describe('#validateFlags', () => {
    it('should default page to 1', () => {
      assert.equal(uut.validateFlags({}), 1)
    })

    it('should parse positive integer page', () => {
      assert.equal(uut.validateFlags({ page: '3' }), 3)
      assert.equal(uut.validateFlags({ page: 5 }), 5)
    })

    it('should throw if page is not a positive integer', () => {
      try {
        uut.validateFlags({ page: '0' })
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'positive integer')
      }
    })
  })
})
