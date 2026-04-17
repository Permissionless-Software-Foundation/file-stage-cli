/*
  Upload a file from the files/ directory to ipfs-file-stager (staging).
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

// Matches ipfs-file-stager max upload size (see ipfs-use-cases.js/upload).
const MAX_UPLOAD_BYTES = 100 * 1000 * 1000

class IPFSFileUpload {
  constructor () {
    // Encapsulate Dependencies
    this.axios = axios
    this.config = config
    this.fs = fs

    this.run = this.run.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
  }

  async run (flags = {}) {
    try {
      this.validateFlags(flags)

      const result = await this.fileUpload(flags)

      console.log(result)

      return true
    } catch (err) {
      console.error('Error in file-upload :', err.message)
      return 0
    }
  }

  async fileUpload (flags) {
    try {
      const filePath = `${__dirname}../../files/${flags.filename}`

      if (!this.fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath)
      }

      const formData = new FormData()

      const axiosConfig = {
        headers: formData.getHeaders(),
        maxContentLength: MAX_UPLOAD_BYTES,
        maxBodyLength: MAX_UPLOAD_BYTES
      }
      formData.append('file', this.fs.createReadStream(filePath), flags.filename)
      const response = await this.axios.post(`${this.config.stageService}/ipfs/upload`, formData, axiosConfig)
      const { data } = response

      if (!data.success) {
        throw new Error(data.message || 'Upload failed')
      }

      return data
    } catch (err) {
      console.log('Error in fileUpload()', err)
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

export default IPFSFileUpload
