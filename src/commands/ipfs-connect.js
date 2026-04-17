/*
Connect to an IPFS peer

*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class IPFSConnect {
  constructor (flags) {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.connect = this.connect.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const connectionRes = await this.connect(flags)
      console.log(`Connection result : ${connectionRes.success}`)
      console.log(`Connection Details : ${connectionRes.details}`)

      return true
    } catch (err) {
      console.error('Error in ipfs-connect :', err.message)
      return 0
    }
  }

  // Try to connect to an IPFS peer.
  async connect (flags) {
    try {
      const response = await this.axios.post(`${this.config.pinService}/ipfs/connect`, {
        multiaddr: flags.multiaddr,
        getDetails: flags.details
      })
      return response.data
    } catch (err) {
      console.log('Error in connect()', err)
      throw err
    }
  }

  // Validate the command line flags.
  validateFlags (flags = {}) {
    // Multiaddr is required.
    const multiaddr = flags.multiaddr
    if (!multiaddr || multiaddr === '') {
      throw new Error('You must specify a multiaddr with the -m flag.')
    }

    return true
  }
}

export default IPFSConnect
