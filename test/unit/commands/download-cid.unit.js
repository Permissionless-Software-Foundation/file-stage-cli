/*
Unit tests for download-cid command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import DownloadCid from '../../../src/commands/download-cid.js'

describe('#download-cid', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new DownloadCid()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('should return true if all arguments are supplied.', () => {
      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        filename: 'test-file.json'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('should throw error if cid is not supplied.', () => {
      try {
        uut.validateFlags({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a CID with the -c flag.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if filename is not supplied.', () => {
      try {
        uut.validateFlags({
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        })

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

  describe('#run()', () => {
    it('should execute the run function successfully', async () => {
      sandbox.stub(uut, 'downloadFile').resolves(true)

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        filename: 'test-file.json'
      }
      const result = await uut.run(flags)

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'downloadFile').throws(new Error('test error'))

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        filename: 'test-file.json'
      }
      const result = await uut.run(flags)

      assert.equal(result, 0)
    })

    it('should return 0 if validation fails', async () => {
      const result = await uut.run({})

      assert.equal(result, 0)
    })
  })

  describe('#getInfo()', () => {
    it('should return file info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
          filename: 'test-file.json'
        }
      })

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      const result = await uut.getInfo(flags)

      assert.property(result, 'cid')
      assert.property(result, 'filename')
    })

    it('should throw error if CID not found', async () => {
      try {
        sandbox.stub(uut.axios, 'get').resolves({ data: null })

        await uut.getInfo({ cid: 'test' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'not found')
      }
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('test error'))
        await uut.getInfo({ cid: 'test' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#downloadFile()', () => {
    it('should download a file successfully', async () => {
      // Create a mock readable stream using an async generator
      async function * mockStream () {
        yield Buffer.from('chunk1')
        yield Buffer.from('chunk2')
      }

      const mockWritableStream = {
        on: sandbox.stub(),
        write: sandbox.stub(),
        end: sandbox.stub()
      }
      sandbox.stub(uut.fs, 'createWriteStream').returns(mockWritableStream)
      sandbox.stub(uut.axios, 'get').resolves({ data: mockStream() })

      const result = await uut.downloadFile({
        flags: {
          filename: 'test-file.json',
          cid: 'test-cid'
        }
      })

      assert.equal(result, true)
      assert.equal(mockWritableStream.write.callCount, 2)
      assert.isTrue(mockWritableStream.end.calledOnce)
    })

    it('should handle download error', async () => {
      try {
        sandbox.stub(uut.axios, 'get').throws(new Error('download error'))

        const mockWritableStream = {
          on: sandbox.stub(),
          write: sandbox.stub(),
          end: sandbox.stub()
        }
        sandbox.stub(uut.fs, 'createWriteStream').returns(mockWritableStream)

        await uut.downloadFile({
          flags: {
            filename: 'test-file.json',
            cid: 'test-cid'
          }
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'download error')
      }
    })
  })

  describe('#writeStreamError()', () => {
    it('should handle write stream error', () => {
      const result = uut.writeStreamError(new Error('write error'))

      assert.equal(result, true)
    })
  })

  describe('#writeStreamFinished()', () => {
    it('should handle write stream finish', () => {
      const result = uut.writeStreamFinished()

      assert.equal(result, true)
    })
  })
})
