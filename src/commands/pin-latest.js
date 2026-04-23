/*
  Fetch a page of latest pins from ipfs-file-stager (GET /ipfs/pins/<page>).
*/

// Global npm libraries
import axios from 'axios'
import config from '../../config/index.js'

class PinLatest {
  constructor () {
    this.axios = axios
    this.config = config

    this.run = this.run.bind(this)
    this.fetchPins = this.fetchPins.bind(this)
    this.validateFlags = this.validateFlags.bind(this)
  }

  async run (flags = {}) {
    try {
      const page = this.validateFlags(flags)

      const result = await this.fetchPins(page)

      console.log(result.pins.pins)

      return true
    } catch (err) {
      console.error('Error in pin-latest:', err.message)
      return 0
    }
  }

  async fetchPins (page) {
    try {
      const url = `${this.config.stageService}/ipfs/pins/${page}`
      const response = await this.axios.get(url)

      return response.data
    } catch (err) {
      console.log('Error in fetchPins()', err)
      throw err
    }
  }

  validateFlags (flags = {}) {
    const raw = flags.page
    const page =
      raw === undefined || raw === null || raw === ''
        ? 1
        : parseInt(String(raw), 10)

    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page (-p) must be a positive integer (default: 1).')
    }

    return page
  }
}

export default PinLatest
