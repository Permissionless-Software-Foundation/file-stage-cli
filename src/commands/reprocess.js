/*
  Given a CID, this command will download the info about it.
  If the Claim has a validClaim property of null, then this command will
  attempt to repin the CID.
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class IPFSRepin {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
    this.pinClaim = this.pinClaim.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      // Get information needed to re-submit the pin claim.
      const fileInfo = await this.getInfo(flags)
      console.log(fileInfo)

      await this.pinClaim(fileInfo)

      return true
    } catch (err) {
      console.error('Error in file-info :', err.message)
      return 0
    }
  }

  // Repin a CID.
  async pinClaim (fileInfo) {
    try {
      const response = await this.axios.post(`${this.config.pinService}/ipfs/pin-claim/`, fileInfo)
      console.log('response: ', response)

      const { data } = response
      console.log('data: ', data)

      return data
    } catch (err) {
      console.log('Error in pinClaim()', err)
      throw err
    }
  }

  // Get information about a file in IPFS.
  async getInfo (flags) {
    try {
      const response = await this.axios.get(`${this.config.pinService}/ipfs/pin-status/${flags.cid}`)
      // console.log('response: ', response)

      const { data } = response

      const { proofOfBurnTxid, claimTxid, filename, address, cid } = data

      const info = { proofOfBurnTxid, claimTxid, filename, address, cid }

      return info
    } catch (err) {
      console.log('Error in getInfo()', err)
      throw err
    }
  }

  // Validate the command line flags.
  validateFlags (flags = {}) {
    // Multiaddr is required.
    const cid = flags.cid
    if (!cid || cid === '') {
      throw new Error('You must specify a CID with the -c flag.')
    }

    return true
  }
}

export default IPFSRepin
