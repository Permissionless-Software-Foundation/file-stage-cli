/*
  Given a CID, this command will download the file pin status, similar to the
  pin-status command. If the pin has expired, this command will then generate a
  proof of burn, then generate a new pin claim transaction to renew the pin.
*/

// Global npm libraries
import axios from 'axios'
import PSFFPP from 'psffpp/index.js'

// Local libraries
import WalletUtil from '../lib/wallet-util.js'
import WalletBalance from './wallet-balance.js'
import config from '../../config/index.js'

// PSF Token ID constant
const PSF_TOKEN_ID = '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

class PinRenew {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config
    this.PSFFPP = PSFFPP
    this.walletUtil = new WalletUtil()
    this.walletBalance = new WalletBalance()

    // Bind 'this' object to all subfunctions.
    this.run = this.run.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
    this.checkExpiration = this.checkExpiration.bind(this)
    this.checkPSFTokens = this.checkPSFTokens.bind(this)
    this.renewPinClaim = this.renewPinClaim.bind(this)
    this.getInfo = this.getInfo.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      // Check if the pin claim has expired
      const fileInfo = await this.checkExpiration(flags)

      // Check if wallet has PSF tokens
      const wallet = await this.checkPSFTokens(flags)

      // Renew the pin claim
      const { pobTxid, claimTxid } = await this.renewPinClaim(fileInfo, wallet)

      // Display success message
      console.log('\n✅ Pin claim renewed successfully!')
      console.log(`Proof of Burn TXID: ${pobTxid}`)
      console.log(`Pin Claim TXID: ${claimTxid}`)
      console.log('Pin claim has been renewed for one year.')

      return true
    } catch (err) {
      console.error('Error in pin-renew:', err.message)
      return 0
    }
  }

  // Validate the command line flags.
  validateFlags (flags = {}) {
    const cid = flags.cid
    if (!cid || cid === '') {
      throw new Error('You must specify a CID with the -c flag.')
    }

    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet name with the -n flag.')
    }

    return true
  }

  // Get information about a file in IPFS (copied from pin-status.js)
  async getInfo (flags) {
    try {
      const response = await this.axios.get(`${this.config.pinService}/ipfs/pin-status/${flags.cid}`)

      const { data } = response
      const info = data

      // Add claimTime and expirationTime if claimTxDetails.time exists
      if (info.claimTxDetails && info.claimTxDetails.time !== undefined && info.claimTxDetails.time !== null) {
        // Convert Unix timestamp (seconds) to Date object (milliseconds)
        const claimDate = new Date(info.claimTxDetails.time * 1000)
        info.claimTime = claimDate.toISOString()

        // Calculate expiration time (one year later)
        const expirationDate = new Date(claimDate)
        expirationDate.setFullYear(expirationDate.getFullYear() + 1)
        info.expirationTime = expirationDate.toISOString()
      }

      return info
    } catch (err) {
      console.log('Error in getInfo()', err)
      throw err
    }
  }

  // Check if the pin claim has expired
  async checkExpiration (flags) {
    try {
      const fileInfo = await this.getInfo(flags)

      // Check if expirationTime exists
      if (!fileInfo.expirationTime) {
        throw new Error('Unable to determine expiration time for this pin claim.')
      }

      // Check if expired
      const isExpired = new Date(fileInfo.expirationTime) < new Date()

      if (!isExpired) {
        console.log('⚠️  WARNING: The pin claim has not expired yet.')
        console.log(`Expiration time: ${fileInfo.expirationTime}`)
        console.log('Continuing with renewal anyway...')
      } else {
        console.log('⚠️  Pin claim has expired. Proceeding with renewal...')
        console.log(`Expiration time: ${fileInfo.expirationTime}`)
      }

      return fileInfo
    } catch (err) {
      console.log('Error in checkExpiration()', err)
      throw err
    }
  }

  // Check if wallet has PSF tokens
  async checkPSFTokens (flags) {
    try {
      // Instance wallet
      const wallet = await this.walletUtil.instanceWallet(flags.name)
      await wallet.initialize()

      // Combine token UTXOs
      const tokenUtxos = wallet.utxos.utxoStore.slpUtxos.type1.tokens.concat(
        wallet.utxos.utxoStore.slpUtxos.group.tokens,
        wallet.utxos.utxoStore.slpUtxos.nft.tokens
      )

      // Get token balances
      const tokens = this.walletBalance.getTokenBalances(tokenUtxos)

      // Find PSF token
      const psfToken = tokens.find(token => token.tokenId === PSF_TOKEN_ID)

      if (!psfToken || psfToken.qty === 0) {
        throw new Error('Wallet does not contain PSF tokens. Please add PSF tokens to the wallet before renewing a pin claim.')
      }

      console.log(`PSF token balance: ${psfToken.qty} PSF`)

      return wallet
    } catch (err) {
      console.log('Error in checkPSFTokens()', err)
      throw err
    }
  }

  // Renew the pin claim by creating a new PoB and Pin Claim transaction
  async renewPinClaim (fileInfo, wallet) {
    try {
      // Calculate file size in megabytes
      const fileSizeInMegabytes = fileInfo.fileSize / 10 ** 6

      console.log(`Renewing pin claim for CID: ${fileInfo.cid}`)
      console.log(`Filename: ${fileInfo.filename}`)
      console.log(`File size: ${fileSizeInMegabytes.toFixed(2)} MB`)

      // Create PSFFPP instance
      const psffpp = new this.PSFFPP({ wallet })

      // Create pin claim (this will generate both PoB and Pin Claim transactions)
      const pinObj = {
        cid: fileInfo.cid,
        filename: fileInfo.filename,
        fileSizeInMegabytes
      }

      const { pobTxid, claimTxid } = await psffpp.createPinClaim(pinObj)

      return { pobTxid, claimTxid }
    } catch (err) {
      console.log('Error in renewPinClaim()', err)
      throw err
    }
  }
}

export default PinRenew
