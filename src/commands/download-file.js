/*
  Get information about a file in IPFS
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'
import fs from 'fs'

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

class DownloadFile {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config
    this.fs = fs

    this.run = this.run.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
    this.downloadFile = this.downloadFile.bind(this)
    this.writeStreamError = this.writeStreamError.bind(this)
    this.writeStreamFinished = this.writeStreamFinished.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const fileInfo = await this.getInfo(flags)
      // Get the metadata from the file info.

      // console.log(fileInfo)

      const { filename } = fileInfo

      await this.downloadFile({ filename, flags })

      return true
    } catch (err) {
      console.error('Error in file-download :', err)
      return 0
    }
  }

  // Download the file from the ipfs-bch-wallet-consumer IPFS node. It is
  // connected to an instance of ipfs-file-pin-service, so it can retrieve
  // the pinned file. It then transfers it to this app via a readable stream
  // from an HTTP call.
  async downloadFile (inObj = {}) {
    try {
      const { filename, flags } = inObj

      // console.log('__dirname: ', __dirname)

      // Open the file for writing.
      const filePath = `${__dirname}../../files/${filename}`
      const writableStream = this.fs.createWriteStream(filePath)
      writableStream.on('error', this.writeStreamError)
      writableStream.on('finish', this.writeStreamFinished)

      // Get the readable stream for the file
      const result = await this.axios.get(`${this.config.pinService}/ipfs/download/${flags.cid}`, { responseType: 'stream' })
      const fileReadStream = result.data

      for await (const buf of fileReadStream) {
        writableStream.write(buf)
      }
      writableStream.end()

      console.log(`...download complete. File ${filename} saved to the files directory.`)

      return true
    } catch (err) {
      console.error('Error in downloadFile()')
      throw err
    }
  }

  writeStreamError (error) {
    console.log(`An error occured while writing to the file. Error: ${error.message}`)

    return true
  }

  writeStreamFinished () {
    console.log('File has finished downloading.')

    return true
  }

  // Get information about a file in IPFS.
  async getInfo (flags) {
    try {
      const response = await this.axios.get(`${this.config.pinService}/ipfs/pin-status/${flags.cid}`)
      // console.log('response: ', response)

      const { data } = response

      const info = data
      // If the metadata is not found, throw an error.
      if (!info || !info.cid) {
        throw new Error(`CID ${flags.cid} not found!`)
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

export default DownloadFile
