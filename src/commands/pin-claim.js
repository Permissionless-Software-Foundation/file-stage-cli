/*
Trigger a pin claim request.
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class IPFSPinClaim {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.pinClaim = this.pinClaim.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const result = await this.pinClaim(flags)

      console.log(result)

      return true
    } catch (err) {
      console.error('Error in pin-claim :', err.message)
      return 0
    }
  }

  // processPinClaim
  async pinClaim (flags) {
    try {
      const response = await this.axios.post(`${this.config.pinService}/ipfs/pin-claim/`, flags)
      // console.log('response: ', response)

      const { data } = response

      if (!data.success) {
        throw new Error(data.message)
      }

      return data
    } catch (err) {
      console.log('Error in pinClaim()', err)
      throw err
    }
  }

  // Validate the command line flags.
  validateFlags (flags = {}) {
    const cid = flags.cid
    if (!cid || cid === '') {
      throw new Error('You must specify a CID with the -c flag.')
    }

    const proofOfBurnTxid = flags.proofOfBurnTxid
    if (!proofOfBurnTxid || proofOfBurnTxid === '') {
      throw new Error('You must specify a proofOfBurnTxid with the -p flag.')
    }

    const claimTxid = flags.claimTxid
    if (!claimTxid || claimTxid === '') {
      throw new Error('You must specify a claimTxid with the -t flag.')
    }

    const filename = flags.filename
    if (!filename || filename === '') {
      throw new Error('You must specify a filename with the -f flag.')
    }

    const address = flags.address
    if (!address || address === '') {
      throw new Error('You must specify a address with the -a flag.')
    }

    return true
  }
}

export default IPFSPinClaim
