/*
Unit tests for reprocess command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSRepin from '../../../src/commands/reprocess.js'

describe('#reprocess', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSRepin()
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
      const mockFileInfo = {
        proofOfBurnTxid: 'txid1',
        claimTxid: 'txid2',
        filename: 'test.json',
        address: 'bitcoincash:qtest',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      sandbox.stub(uut, 'getInfo').resolves(mockFileInfo)
      sandbox.stub(uut, 'pinClaim').resolves({ success: true })

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
    it('should return file info', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          proofOfBurnTxid: 'txid1',
          claimTxid: 'txid2',
          filename: 'test.json',
          address: 'bitcoincash:qtest',
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        }
      })

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      const result = await uut.getInfo(flags)

      assert.property(result, 'proofOfBurnTxid')
      assert.property(result, 'claimTxid')
      assert.property(result, 'filename')
      assert.property(result, 'address')
      assert.property(result, 'cid')
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

  describe('#pinClaim()', () => {
    it('should resubmit a pin claim', async () => {
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: true } })

      const fileInfo = {
        proofOfBurnTxid: 'txid1',
        claimTxid: 'txid2',
        filename: 'test.json',
        address: 'bitcoincash:qtest',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      }
      const result = await uut.pinClaim(fileInfo)

      assert.isObject(result)
      assert.equal(result.success, true)
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        await uut.pinClaim({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })
})
