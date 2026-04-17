/*
Unit tests for pin-renew command
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import PinRenew from '../../../src/commands/pin-renew.js'

describe('#pin-renew', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new PinRenew()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('should return true if all arguments are supplied.', () => {
      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        name: 'test-wallet'
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

    it('should throw error if wallet name is not supplied.', () => {
      try {
        uut.validateFlags({
          cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet name with the -n flag.',
          'Expected error message.'
        )
      }
    })
  })

  describe('#run()', () => {
    it('should execute the run function successfully', async () => {
      sandbox.stub(uut, 'checkExpiration').resolves({
        cid: 'test-cid',
        filename: 'test.json',
        fileSize: 1000000
      })
      sandbox.stub(uut, 'checkPSFTokens').resolves({})
      sandbox.stub(uut, 'renewPinClaim').resolves({
        pobTxid: 'txid1',
        claimTxid: 'txid2'
      })

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
        name: 'test-wallet'
      }
      const result = await uut.run(flags)

      assert.equal(result, true)
    })

    it('should handle an error', async () => {
      sandbox.stub(uut, 'checkExpiration').throws(new Error('test error'))

      const flags = {
        cid: 'bafybeied3zdwdiro7fqytyha2yfband4lwcrtozmf6shynylt3kexh26dq',
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

  describe('#getInfo()', () => {
    it('should return file info with expiration time', async () => {
      const mockTime = 1700000000
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          cid: 'test-cid',
          claimTxDetails: { time: mockTime }
        }
      })

      const flags = { cid: 'test-cid' }
      const result = await uut.getInfo(flags)

      assert.property(result, 'claimTime')
      assert.property(result, 'expirationTime')
    })

    it('should return file info without expiration when claimTxDetails absent', async () => {
      sandbox.stub(uut.axios, 'get').resolves({
        data: { cid: 'test-cid' }
      })

      const flags = { cid: 'test-cid' }
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

  describe('#checkExpiration()', () => {
    it('should return file info for an expired pin', async () => {
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 2)

      sandbox.stub(uut, 'getInfo').resolves({
        cid: 'test-cid',
        expirationTime: pastDate.toISOString()
      })

      const result = await uut.checkExpiration({ cid: 'test-cid' })

      assert.property(result, 'expirationTime')
    })

    it('should return file info for a non-expired pin', async () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      sandbox.stub(uut, 'getInfo').resolves({
        cid: 'test-cid',
        expirationTime: futureDate.toISOString()
      })

      const result = await uut.checkExpiration({ cid: 'test-cid' })

      assert.property(result, 'expirationTime')
    })

    it('should throw error if expirationTime is not available', async () => {
      try {
        sandbox.stub(uut, 'getInfo').resolves({ cid: 'test-cid' })

        await uut.checkExpiration({ cid: 'test-cid' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Unable to determine expiration time')
      }
    })

    it('should handle error from getInfo', async () => {
      try {
        sandbox.stub(uut, 'getInfo').throws(new Error('getInfo error'))

        await uut.checkExpiration({ cid: 'test-cid' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'getInfo error')
      }
    })
  })

  describe('#checkPSFTokens()', () => {
    it('should return wallet if PSF tokens are found', async () => {
      const PSF_TOKEN_ID = '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
      const mockWallet = {
        initialize: sandbox.stub().resolves(),
        utxos: {
          utxoStore: {
            slpUtxos: {
              type1: {
                tokens: [{ tokenId: PSF_TOKEN_ID, ticker: 'PSF', qtyStr: '10' }]
              },
              group: { tokens: [] },
              nft: { tokens: [] }
            }
          }
        }
      }
      sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)

      const result = await uut.checkPSFTokens({ name: 'test-wallet' })

      assert.equal(result, mockWallet)
    })

    it('should throw error if no PSF tokens found', async () => {
      try {
        const mockWallet = {
          initialize: sandbox.stub().resolves(),
          utxos: {
            utxoStore: {
              slpUtxos: {
                type1: { tokens: [] },
                group: { tokens: [] },
                nft: { tokens: [] }
              }
            }
          }
        }
        sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)

        await uut.checkPSFTokens({ name: 'test-wallet' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Wallet does not contain PSF tokens')
      }
    })

    it('should handle wallet instantiation error', async () => {
      try {
        sandbox.stub(uut.walletUtil, 'instanceWallet').throws(new Error('wallet error'))

        await uut.checkPSFTokens({ name: 'test-wallet' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'wallet error')
      }
    })
  })

  describe('#renewPinClaim()', () => {
    it('should renew a pin claim successfully', async () => {
      const mockPsffpp = {
        createPinClaim: sandbox.stub().resolves({
          pobTxid: 'txid1',
          claimTxid: 'txid2'
        })
      }
      uut.PSFFPP = sandbox.stub().returns(mockPsffpp)

      const fileInfo = {
        cid: 'test-cid',
        filename: 'test.json',
        fileSize: 1000000
      }
      const mockWallet = {}

      const result = await uut.renewPinClaim(fileInfo, mockWallet)

      assert.property(result, 'pobTxid')
      assert.property(result, 'claimTxid')
      assert.equal(result.pobTxid, 'txid1')
      assert.equal(result.claimTxid, 'txid2')
    })

    it('should handle createPinClaim error', async () => {
      try {
        const mockPsffpp = {
          createPinClaim: sandbox.stub().throws(new Error('pin claim error'))
        }
        uut.PSFFPP = sandbox.stub().returns(mockPsffpp)

        const fileInfo = {
          cid: 'test-cid',
          filename: 'test.json',
          fileSize: 1000000
        }
        await uut.renewPinClaim(fileInfo, {})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'pin claim error')
      }
    })
  })
})
