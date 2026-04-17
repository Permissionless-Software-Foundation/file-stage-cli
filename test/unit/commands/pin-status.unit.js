/*
Unit tests for pin-status command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import PinStatus from '../../../src/commands/pin-status.js'

describe('#pin-status', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new PinStatus()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('should return true if all arguments are supplied.', () => {
      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
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
  })

  describe('#run()', () => {
    it('should execute the run function successfully', async () => {
      sandbox.stub(uut, 'getInfo').resolves({
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        expirationTime: new Date(Date.now() + 86400000).toISOString()
      })

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      const result = await uut.run(flags)

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'getInfo').throws(new Error('test error'))
      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
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
    it('should return file info with expiration time', async () => {
      const mockTime = 1700000000
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
          claimTxDetails: { time: mockTime }
        }
      })

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      const result = await uut.getInfo(flags)

      assert.property(result, 'claimTime')
      assert.property(result, 'expirationTime')
    })

    it('should return file info without expiration time when claimTxDetails is absent', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        }
      })

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      const result = await uut.getInfo(flags)

      assert.notProperty(result, 'claimTime')
      assert.notProperty(result, 'expirationTime')
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
})
