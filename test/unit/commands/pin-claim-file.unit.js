/*
Unit tests for pin-claim-file command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import PinClaimFile from '../../../src/commands/pin-claim-file.js'

describe('#pin-claim-file', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new PinClaimFile()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('should return true if all arguments are supplied.', () => {
      const flags = {
        filename: 'test-file.json',
        name: 'test-wallet'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('should throw error if filename is not supplied.', () => {
      try {
        uut.validateFlags({ name: 'test-wallet' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a filename with the -f flag.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if wallet name is not supplied.', () => {
      try {
        uut.validateFlags({ filename: 'test-file.json' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet name with the -n flag.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if no flags are supplied.', () => {
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

  describe('#getFileSize()', () => {
    it('should return the file size in megabytes', () => {
      sandbox.stub(uut.fs, 'existsSync').returns(true)
      sandbox.stub(uut.fs, 'statSync').returns({ size: 1048576 }) // 1 MB

      const result = uut.getFileSize('test-file.json')

      assert.equal(result, 1)
    })

    it('should throw error if file is not found', () => {
      try {
        sandbox.stub(uut.fs, 'existsSync').returns(false)

        uut.getFileSize('nonexistent-file.json')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'File not found')
      }
    })

    it('should handle errors from statSync', () => {
      try {
        sandbox.stub(uut.fs, 'existsSync').returns(true)
        sandbox.stub(uut.fs, 'statSync').throws(new Error('stat error'))

        uut.getFileSize('test-file.json')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'stat error')
      }
    })
  })

  describe('#run()', () => {
    it('should execute the run function successfully', async () => {
      sandbox.stub(uut, 'pinClaimFile').resolves({
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        pobTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
        claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2'
      })

      const flags = {
        filename: 'test-file.json',
        name: 'test-wallet'
      }
      const result = await uut.run(flags)

      assert.isObject(result)
      assert.property(result, 'cid')
      assert.property(result, 'pobTxid')
      assert.property(result, 'claimTxid')
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'pinClaimFile').throws(new Error('test error'))
      const flags = {
        filename: 'test-file.json',
        name: 'test-wallet'
      }
      const result = await uut.run(flags)

      assert.equal(result, 0)
    })

    it('should return 0 if validation fails', async () => {
      const result = await uut.run({})

      assert.equal(result, 0)
    })
  })

  describe('#pinClaimFile()', () => {
    it('should upload file and create pin claim successfully', async () => {
      // Stub getFileSize
      sandbox.stub(uut, 'getFileSize').returns(1.5)

      // Stub pin upload
      sandbox.stub(uut.pinUpload, 'pinUpload').resolves({
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
      })

      // Stub wallet instantiation
      const mockWallet = {
        walletInfo: {
          address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
        }
      }
      sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)

      // Stub PSFFPP constructor and createPinClaim
      const mockPsffpp = {
        createPinClaim: sandbox.stub().resolves({
          pobTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
          claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2'
        })
      }
      uut.PSFFPP = sandbox.stub().returns(mockPsffpp)

      // Stub axios post for pin claim notification
      sandbox.stub(uut.axios, 'post').resolves({ data: { success: true } })

      const flags = {
        filename: 'test-file.json',
        name: 'test-wallet'
      }
      const result = await uut.pinClaimFile(flags)

      assert.isObject(result)
      assert.equal(result.cid, 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq')
      assert.equal(result.pobTxid, 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c')
      assert.equal(result.claimTxid, 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2')
    })

    it('should throw error if getFileSize fails', async () => {
      try {
        sandbox.stub(uut, 'getFileSize').throws(new Error('File not found'))

        const flags = {
          filename: 'nonexistent-file.json',
          name: 'test-wallet'
        }
        await uut.pinClaimFile(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'File not found')
      }
    })

    it('should throw error if pin upload fails', async () => {
      try {
        sandbox.stub(uut, 'getFileSize').returns(1.5)
        sandbox.stub(uut.pinUpload, 'pinUpload').throws(new Error('upload error'))

        const flags = {
          filename: 'test-file.json',
          name: 'test-wallet'
        }
        await uut.pinClaimFile(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'upload error')
      }
    })

    it('should throw error if wallet instantiation fails', async () => {
      try {
        sandbox.stub(uut, 'getFileSize').returns(1.5)
        sandbox.stub(uut.pinUpload, 'pinUpload').resolves({
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        })
        sandbox.stub(uut.walletUtil, 'instanceWallet').throws(new Error('wallet error'))

        const flags = {
          filename: 'test-file.json',
          name: 'test-wallet'
        }
        await uut.pinClaimFile(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'wallet error')
      }
    })

    it('should throw error if createPinClaim fails', async () => {
      try {
        sandbox.stub(uut, 'getFileSize').returns(1.5)
        sandbox.stub(uut.pinUpload, 'pinUpload').resolves({
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        })

        const mockWallet = {
          walletInfo: {
            address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
          }
        }
        sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)

        const mockPsffpp = {
          createPinClaim: sandbox.stub().throws(new Error('pin claim error'))
        }
        uut.PSFFPP = sandbox.stub().returns(mockPsffpp)

        const flags = {
          filename: 'test-file.json',
          name: 'test-wallet'
        }
        await uut.pinClaimFile(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'pin claim error')
      }
    })

    it('should throw error if pinning service notification fails', async () => {
      try {
        sandbox.stub(uut, 'getFileSize').returns(1.5)
        sandbox.stub(uut.pinUpload, 'pinUpload').resolves({
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        })

        const mockWallet = {
          walletInfo: {
            address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
          }
        }
        sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)

        const mockPsffpp = {
          createPinClaim: sandbox.stub().resolves({
            pobTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
            claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2'
          })
        }
        uut.PSFFPP = sandbox.stub().returns(mockPsffpp)

        sandbox.stub(uut.axios, 'post').resolves({
          data: { success: false, message: 'service error' }
        })

        const flags = {
          filename: 'test-file.json',
          name: 'test-wallet'
        }
        await uut.pinClaimFile(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'service error')
      }
    })

    it('should throw error if axios post throws', async () => {
      try {
        sandbox.stub(uut, 'getFileSize').returns(1.5)
        sandbox.stub(uut.pinUpload, 'pinUpload').resolves({
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        })

        const mockWallet = {
          walletInfo: {
            address: 'bitcoincash:qqs2wrahl6azn9qdyrmp9ygeejqvzr8ruv7e9m30fr'
          }
        }
        sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)

        const mockPsffpp = {
          createPinClaim: sandbox.stub().resolves({
            pobTxid: 'be4b63156c93f58ed311d403d9f756deda9abbc81d0fef8fbe5d769538b4261c',
            claimTxid: 'c71e2f2cdf8658d90c61ac6183b8ffeeb359779807b317386044705d8352f0f2'
          })
        }
        uut.PSFFPP = sandbox.stub().returns(mockPsffpp)

        sandbox.stub(uut.axios, 'post').throws(new Error('network error'))

        const flags = {
          filename: 'test-file.json',
          name: 'test-wallet'
        }
        await uut.pinClaimFile(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'network error')
      }
    })
  })
})
