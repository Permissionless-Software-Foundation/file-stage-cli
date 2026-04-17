/*
  Get Wallet Service Information
*/

// Global npm libraries
import axios from 'axios'

// Local libraries
import config from '../../config/index.js'

class WalletService {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.getBCHServiceInfo = this.getBCHServiceInfo.bind(this)
    this.getIPFSServiceInfo = this.getIPFSServiceInfo.bind(this)
  }

  async run (flags) {
    try {
      // Show consumer url
      console.log(`Wallet Consumer URL : ${this.config.walletUrl}`)

      // Show wallet service provider
      const bchService = await this.getBCHServiceInfo(flags)
      console.log(`Wallet Service Provider : ${bchService.selectedServiceProvider}`)

      // Show ipfs provider
      const ipfsService = await this.getIPFSServiceInfo(flags)
      console.log(`IPFS Service Provider : ${ipfsService.selectedIpfsFileProvider}`)

      return true
    } catch (err) {
      console.error('Error in ipfs-peers :', err.message)
      return 0
    }
  }

  //  Get Wallet Service Information
  async getBCHServiceInfo () {
    try {
      const response = await this.axios.get(`${this.config.walletUrl}/bch/service`)
      return response.data
    } catch (err) {
      console.log('Error in getBCHServiceInfo()')
      throw err
    }
  }

  //  Get IPFS Service Information
  async getIPFSServiceInfo () {
    try {
      const response = await this.axios.get(`${this.config.walletUrl}/ipfs/service`)
      return response.data
    } catch (err) {
      console.log('Error in getIPFSServiceInfo()')
      throw err
    }
  }
}

export default WalletService
