/*
  Trigger a pin upload request.
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'
import fs from 'fs'
import FormData from 'form-data'

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

class IPFSPinUpload {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config
    this.fs = fs

    this.run = this.run.bind(this)
    this.pinUpload = this.pinUpload.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const result = await this.pinUpload(flags)

      console.log(result)

      return true
    } catch (err) {
      console.error('Error in pin-claim :', err.message)
      return 0
    }
  }

  // upload a file to IPFS
  async pinUpload (flags) {
    try {
      const filePath = `${__dirname}../../files/${flags.filename}`

      if (!this.fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath)
      }

      const formData = new FormData()

      const axiosConfig = {
        headers: formData.getHeaders(),
        maxContentLength: 10 * 1024 * 1024 * 1024, // 10GB - matches server limit
        maxBodyLength: 10 * 1024 * 1024 * 1024 // 10GB - matches server limit
      }
      formData.append('file', this.fs.createReadStream(filePath), flags.filename)
      const response = await this.axios.post(`${this.config.pinService}/ipfs/pin-local-file/`, formData, axiosConfig)
      // console.log('response: ', response)
      const { data } = response

      if (!data.success) {
        throw new Error(data.message)
      }

      return data
    } catch (err) {
      console.log('Error in pinUpload()', err)
      throw err
    }
  }

  // Validate the command line flags.
  validateFlags (flags = {}) {
    const filename = flags.filename
    if (!filename || filename === '') {
      throw new Error('You must specify a filename with the -f flag.')
    }

    return true
  }
}

export default IPFSPinUpload
