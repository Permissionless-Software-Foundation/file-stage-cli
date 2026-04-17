/*
Unit tests for pin-claim command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import IPFSPinClaim from '../../../src/commands/pin-claim.js'

describe('#pin-claim', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new IPFSPinClaim()
  })

  afterEach(() => {
    sandbox.restore()
  })
  describe('#run', () => {
    it('should execute the run function', async () => {
      sandbox.stub(uut, 'pinClaim').resolves(true)

      const flags = {
        proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
        filename: 'mutable-67ccefcca67097473e78ca10.json',
        address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
      }
      const result = await uut.run(flags)

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'pinClaim').throws(new Error('test error'))
      const flags = {
        proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
        filename: 'mutable-67ccefcca67097473e78ca10.json',
        address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
      }
      const result = await uut.run(flags)

      assert.equal(result, 0)
    })
  })

  describe('#pinClaim', () => {
    it('should handle pin claim request success', async () => {
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: true } })
      const flags = {
        proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
        filename: 'mutable-67ccefcca67097473e78ca10.json',
        address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
      }
      const result = await uut.pinClaim(flags)

      assert.isObject(result)
      assert.isObject(result, 'Expected result to be an object')
    })

    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        const flags = {
          proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
          claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
          filename: 'mutable-67ccefcca67097473e78ca10.json',
          address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
        }
        await uut.pinClaim(flags)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.message, 'test error')
      }
    })

    it('should handle network disconnect', async () => {
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: false, message: 'timeout error' } })
      const flags = {
        proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
        filename: 'mutable-67ccefcca67097473e78ca10.json',
        address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
      }
      try {
        await uut.pinClaim(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'timeout error')
      }
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true if all arguments are supplied.', () => {
      const flags = {
        proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
        filename: 'mutable-67ccefcca67097473e78ca10.json',
        address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if cid is not supplied.', () => {
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
    it('validateFlags() should throw error if proofOfBurnTxid is not supplied.', () => {
      try {
        const flags = {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        }
        uut.validateFlags(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a proofOfBurnTxid with the -p flag.',
          'Expected error message.'
        )
      }
    })
    it('validateFlags() should throw error if claimTxid is not supplied.', () => {
      try {
        const flags = {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
          proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c'
        }
        uut.validateFlags(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a claimTxid with the -t flag.',
          'Expected error message.'
        )
      }
    })
    it('validateFlags() should throw error if filename is not supplied.', () => {
      try {
        const flags = {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
          proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
          claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2'
        }
        uut.validateFlags(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a filename with the -f flag.',
          'Expected error message.'
        )
      }
    })
    it('validateFlags() should throw error if address is not supplied.', () => {
      try {
        const flags = {
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
          proofOfBurnTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
          claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2',
          filename: 'mutable-67ccefcca67097473e78ca10.json'
        }
        uut.validateFlags(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a address with the -a flag.',
          'Expected error message.'
        )
      }
    })
  })
})
