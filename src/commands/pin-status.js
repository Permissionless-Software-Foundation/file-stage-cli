/*
  Get the pin-status of a CID
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class PinStatus {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const fileInfo = await this.getInfo(flags)
      // Get the metadata from the file info.

      console.log(fileInfo)

      // Check if the pin claim has expired
      if (new Date(fileInfo.expirationTime) < new Date()) {
        console.log('⚠️  WARNING: The pin claim has expired!')
      }

      return true
    } catch (err) {
      console.error('Error in file-info :', err.message)
      return 0
    }
  }

  // Get information about a file in IPFS.
  async getInfo (flags) {
    try {
      const response = await this.axios.get(`${this.config.pinService}/ipfs/pin-status/${flags.cid}`)
      // console.log('response: ', response)

      const { data } = response

      // if (!data.success) {
      //   throw new Error(data.message)
      // }

      // const info = data.fileMetadata
      // // If the metadata is not found, throw an error.
      // if (!info || !info.cid) {
      //   throw new Error(`CID ${flags.cid} not found!`)
      // }

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

export default PinStatus
