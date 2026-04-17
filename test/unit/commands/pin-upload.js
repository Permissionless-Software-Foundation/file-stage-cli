/*
Unit tests for pin-claim command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSPinUpload from '../../../src/commands/pin-upload.js'

describe('#pin-upload', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSPinUpload()
  })

  afterEach(() => {
    sandbox.restore()
  })
  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'pinUpload').resolves(true)

      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      const result = await uut.run(flags)

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'pinUpload').throws(new Error('test error'))
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      const result = await uut.run(flags)

      assert.equal(result, 0)
    })
  })

  describe('#pinUpload', () => {
    it('should handle pin upload request success', async () => {
      sandbox.stub(uut.fs, 'existsSync').returns(true)
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: true } })
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      const result = await uut.pinUpload(flags)

      assert.isObject(result)
      assert.isObject(result, 'Expected result to be an object')
    })
    it('should handle file not found error', async () => {
      try {
        sandbox.stub(uut.fs, 'existsSync').returns(false)
        const flags = {
          filename: 'mutable-67ccefcca67097473e78ca10.json'
        }
        await uut.pinUpload(flags)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'File not found')
      }
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.fs, 'existsSync').returns(true)
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        const flags = {
          filename: 'mutable-67ccefcca67097473e78ca10.json'
        }
        await uut.pinUpload(flags)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })

    it('should handle network disconnect', async () => {
      sandbox.stub(uut.fs, 'existsSync').returns(true)
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: false, message: 'timeout error' } })
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      try {
        await uut.pinUpload(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'timeout error')
      }
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true if all arguments are supplied.', () => {
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if filename is not supplied.', () => {
      try {
        uut.validateFlags({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a filename with the -f flag.',
          'Expected error message.'
        )
      }
    })
  })
})
