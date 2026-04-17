/*
Unit tests for file-upload command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSFileUpload from '../../../src/commands/file-upload.js'

describe('#file-upload', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSFileUpload()
  })

  afterEach(() => {
    sandbox.restore()
  })
  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'fileUpload').resolves(true)

      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      const result = await uut.run(flags)

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'fileUpload').throws(new Error('test error'))
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      const result = await uut.run(flags)

      assert.equal(result, 0)
    })
  })

  describe('#fileUpload', () => {
    it('should handle file upload request success', async () => {
      sandbox.stub(uut.fs, 'existsSync').returns(true)
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: true, cid: 'bafybeidummy' } })
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      const result = await uut.fileUpload(flags)

      assert.isObject(result)
      assert.equal(result.cid, 'bafybeidummy')
    })
    it('should handle file not found error', async () => {
      try {
        sandbox.stub(uut.fs, 'existsSync').returns(false)
        const flags = {
          filename: 'mutable-67ccefcca67097473e78ca10.json'
        }
        await uut.fileUpload(flags)

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
        await uut.fileUpload(flags)

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
        await uut.fileUpload(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'timeout error')
      }
    })

    it('should throw when success false and no message', async () => {
      sandbox.stub(uut.fs, 'existsSync').returns(true)
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: false } })
      const flags = {
        filename: 'mutable-67ccefcca67097473e78ca10.json'
      }
      try {
        await uut.fileUpload(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Upload failed')
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
