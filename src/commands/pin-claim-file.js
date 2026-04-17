/*
  Upload a file to IPFS and then generate a Pin Claim on the BCH blockchain.
  This command combines the pin-upload step (uploading a file from the files/
  directory to IPFS) with the on-chain Pin Claim generation (proof-of-burn and
  claim transaction), then notifies the pinning service.
*/

// Global npm libraries
import axios from 'axios'
import PSFFPP from 'psffpp/index.js'
import fs from 'fs'

// Local libraries
import WalletUtil from '../lib/wallet-util.js'
import IPFSPinUpload from './pin-upload.js'
import config from '../../config/index.js'

// Hack to get __dirname back.
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

class PinClaimFile {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config
    this.PSFFPP = PSFFPP
    this.walletUtil = new WalletUtil()
    this.pinUpload = new IPFSPinUpload()
    this.fs = fs

    // Bind 'this' object to all subfunctions.
    this.run = this.run.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
    this.getFileSize = this.getFileSize.bind(this)
    this.pinClaimFile = this.pinClaimFile.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const result = await this.pinClaimFile(flags)

      return result
    } catch (err) {
      console.error('Error in pin-claim-file:', err.message)
      return 0
    }
  }

  // Validate the command line flags.
  validateFlags (flags = {}) {
    const filename = flags.filename
    if (!filename || filename === '') {
      throw new Error('You must specify a filename with the -f flag.')
    }

    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet name with the -n flag.')
    }

    return true
  }

  // Get the file size in megabytes for a file in the files/ directory.
  getFileSize (filename) {
    try {
      const filePath = `${__dirname}../../files/${filename}`

      if (!this.fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath)
      }

      const stats = this.fs.statSync(filePath)
      const fileSizeInMegabytes = stats.size / (1024 * 1024)

      return fileSizeInMegabytes
    } catch (err) {
      console.error('Error in getFileSize()')
      throw err
    }
  }

  // Upload a file to IPFS, then generate a Pin Claim on the BCH blockchain,
  // and finally notify the pinning service.
  async pinClaimFile (flags) {
    try {
      const { filename, name } = flags

      // Step 1: Get the file size before uploading.
      const fileSizeInMegabytes = this.getFileSize(filename)
      console.log(`File size: ${fileSizeInMegabytes.toFixed(2)} MB`)

      // Step 2: Upload the file to IPFS to get the CID.
      console.log('\nUploading file to IPFS...')
      const uploadResult = await this.pinUpload.pinUpload({ filename })
      const cid = uploadResult.cid
      console.log(`File uploaded to IPFS with CID: ${cid}`)

      // Step 3: Instantiate the wallet.
      console.log('\nInitializing wallet...')
      const wallet = await this.walletUtil.instanceWallet(name)

      // Step 4: Instantiate the PSFFPP library with the wallet.
      const psffpp = new this.PSFFPP({ wallet })

      // Step 5: Create the Pin Claim on the BCH blockchain.
      console.log('\nGenerating Pin Claim on the BCH blockchain...')
      const pinClaimResult = await psffpp.createPinClaim({
        cid,
        filename,
        fileSizeInMegabytes
      })

      const { pobTxid, claimTxid } = pinClaimResult
      console.log(`\nProof-of-Burn TXID: ${pobTxid}`)
      console.log(`Pin Claim TXID: ${claimTxid}`)

      // Step 6: Notify the pinning service about the new pin claim.
      console.log('\nNotifying pinning service...')
      const address = wallet.walletInfo.address
      const pinClaimData = {
        cid,
        filename,
        claimTxid,
        proofOfBurnTxid: pobTxid,
        address
      }
      const response = await this.axios.post(`${this.config.pinService}/ipfs/pin-claim/`, pinClaimData)
      const { data } = response

      if (!data.success) {
        throw new Error(data.message)
      }

      console.log('\n✅ Pin claim submitted successfully!')
      console.log(`CID: ${cid}`)
      console.log(`Proof-of-Burn TXID: ${pobTxid}`)
      console.log(`Pin Claim TXID: ${claimTxid}`)

      return {
        cid,
        pobTxid,
        claimTxid
      }
    } catch (err) {
      console.error('Error in pinClaimFile()')
      throw err
    }
  }
}

export default PinClaimFile
