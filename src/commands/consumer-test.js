/*
  Test each ipfs-bch-wallet-consumer service listed in the consumers.json file.

  This tests the following for each consumer service:
  - that the consumer service is connected to the property BCH and IPFS file
    service.
  - That the consumer service can retrieve the UTXOs for an address.
  - That the consumer shows a specific file is pinned.
*/

// Global npm libraries
import axios from 'axios'
import BchWallet from 'minimal-slp-wallet'

// Local libraries
import config from '../../config/index.js'

class ConsumerTest {
  constructor () {
    // Encapsulate dependencies
    this.axios = axios
    this.config = config

    // Bind 'this' object to all subfunctions
    this.run = this.run.bind(this)
    this.getConsumerServices = this.getConsumerServices.bind(this)
    this.getBCHServiceInfo = this.getBCHServiceInfo.bind(this)
    this.getIPFSServiceInfo = this.getIPFSServiceInfo.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.getFileInfo = this.getFileInfo.bind(this)
  }

  async run (flags) {
    try {
      // Get the list of consumer services
      const serverUrls = await this.getConsumerServices(flags)
      // console.log('serverUrls: ', serverUrls)

      // Loop through each server URL and test the consumer service.
      for (let i = 0; i < serverUrls.length; i++) {
        const serverUrl = serverUrls[i]
        console.log('\nTesting this consumer service: ', serverUrl)

        // Get the BCH service information
        const bchService = await this.getBCHServiceInfo({ serverUrl })
        console.log('bchService: ', bchService)

        // Get the IPFS service information
        const ipfsService = await this.getIPFSServiceInfo({ serverUrl })
        console.log('ipfsService: ', ipfsService)

        const addr = 'bitcoincash:qzv3zz2trz0xgp6a96lu4m6vp2nkwag0kvg8nfhq4m'
        const balance = await this.getBalance({ serverUrl, addr })
        // console.log('balance: ', balance)
        console.log(`Address ${addr} has ${balance.balance} sats and ${balance.tokens.length} types of SLP tokens.`)

        const cid = 'bafkreibhlm5pbob67r2hfxe5yacisamnt7gjcsiutleqq5aabeg4kohcaa'
        const fileInfo = await this.getFileInfo({ serverUrl, cid })
        // console.log('fileInfo: ', fileInfo)
        console.log(`File ${cid} is pinned: ${fileInfo.dataPinned}`)
      }

      return true
    } catch (err) {
      console.error('Error in ipfs-peers :', err.message)
      return 0
    }
  }

  // Get the list of consumer services. Return an array of server URLs.
  async getConsumerServices (flags) {
    try {
      const response = await this.axios.get('https://consumers.psfoundation.info/consumers.json')
      // console.log('response.data: ', response.data)

      const servers = response.data.servers

      const serverUrls = []
      for (let i = 0; i < servers.length; i++) {
        serverUrls.push(servers[i].value)
      }

      return serverUrls
    } catch (err) {
      console.error('Error in getConsumerServices()')
      throw err
    }
  }

  //  Get Wallet Service Information
  async getBCHServiceInfo (inObj = {}) {
    try {
      const { serverUrl } = inObj
      const response = await this.axios.get(`${serverUrl}/bch/service`)
      return response.data.selectedServiceProvider
    } catch (err) {
      console.log('Error in getBCHServiceInfo()')
      throw err
    }
  }

  //  Get IPFS Service Information
  async getIPFSServiceInfo (inObj = {}) {
    const { serverUrl } = inObj
    try {
      const response = await this.axios.get(`${serverUrl}/ipfs/service`)
      return response.data.selectedIpfsFileProvider
    } catch (err) {
      console.log('Error in getIPFSServiceInfo()')
      throw err
    }
  }

  async getBalance (inObj = {}) {
    try {
      const { serverUrl, addr } = inObj
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: serverUrl
      })
      await wallet.walletInfoPromise

      const balance = await wallet.getBalance({ bchAddress: addr })

      const tokens = await wallet.listTokens(addr)

      return { balance, tokens }
    } catch (err) {
      console.log('Error in getBalance()')
      throw err
    }
  }

  // Get information about a file in IPFS.
  async getFileInfo (inObj = {}) {
    const { serverUrl, cid } = inObj

    try {
      const response = await this.axios.get(`${serverUrl}/ipfs/file-info/${cid}`)
      // console.log('response: ', response)

      const { data } = response

      if (!data.success) {
        throw new Error(data.message)
      }

      const info = data.fileMetadata
      // If the metadata is not found, throw an error.
      if (!info || !info.cid) {
        throw new Error(`CID ${cid} not found!`)
      }
      return info
    } catch (err) {
      console.log('Error in getInfo()', err)
      throw err
    }
  }
}

export default ConsumerTest
