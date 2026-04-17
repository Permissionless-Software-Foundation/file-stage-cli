/*
Get the peers of the IPFS node.
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class IPFSPeers {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.getNodePeers = this.getNodePeers.bind(this)
  }

  async run (flags) {
    try {
      const peers = await this.getNodePeers(flags)
      console.log(JSON.stringify(peers, null, 2))

      return true
    } catch (err) {
      console.error('Error in ipfs-peers :', err.message)
      return 0
    }
  }

  // Get Peers data from the IPFS node.
  async getNodePeers (flags = {}) {
    try {
      const response = await this.axios.post(`${this.config.pinService}/ipfs/peers`, {
        showAll: flags.all
      })
      return response.data.peers
    } catch (err) {
      console.log('Error in getNodePeers()')
      throw err
    }
  }
}

export default IPFSPeers
