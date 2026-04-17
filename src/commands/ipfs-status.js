/*
  Get the status of the IPFS node.
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class IPFSStatus {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.getNodeStatus = this.getNodeStatus.bind(this)
  }

  async run () {
    try {
      const status = await this.getNodeStatus()
      // console.log(status)

      console.log(' ')
      console.log(`IPFS ID: ${status.ipfsId}`)
      console.log(`BCH Address: ${status.bchAddr}`)
      console.log(`SLP Address: ${status.slpAddr}`)
      console.log('MultiAddress: ', status.multiAddrs)
      console.log(`Peers: ${status.peers}`)
      console.log(`Relays: ${status.relays}`)
      console.log(' ')

      return true
    } catch (err) {
      console.error('Error in msg-sign: ')
      return 0
    }
  }

  // Get IPFS node status from the IPFS node.
  async getNodeStatus () {
    try {
      const response = await this.axios.get(`${this.config.pinService}/ipfs`)
      return response.data.status
    } catch (err) {
      console.log('Error in getNodeStatus()')
      throw err
    }
  }
}

export default IPFSStatus
