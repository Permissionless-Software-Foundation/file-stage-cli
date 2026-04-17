/*
  Query the state of the IPFS Circuit Relays this IPFS node is connected to.
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class IPFSRelays {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.getRelays = this.getRelays.bind(this)
  }

  async run () {
    try {
      const relays = await this.getRelays()
      console.log(relays)

      return true
    } catch (err) {
      console.error('Error in ipfs-relays :', err.message)
      return 0
    }
  }

  // Get Relays data from the IPFS node.
  async getRelays () {
    try {
      const response = await this.axios.post(`${this.config.pinService}/ipfs/relays`)
      return response.data.relays
    } catch (err) {
      console.log('Error in getRelays()', err)
      throw err
    }
  }
}

export default IPFSRelays
