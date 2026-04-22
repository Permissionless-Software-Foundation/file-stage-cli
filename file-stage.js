/*
  Primary entry point for the file-stage-cli app (commander.js).
*/

// Global npm libraries
import { Command } from 'commander'

// Local libraries
import DownloadFile from './src/commands/download-file.js'
import IPFSFileUpload from './src/commands/file-upload.js'
import PinLatest from './src/commands/pin-latest.js'
import PinStatus from './src/commands/pin-status.js'

const downloadFile = new DownloadFile()
const ipfsFileUpload = new IPFSFileUpload()
const pinLatest = new PinLatest()
const pinStatus = new PinStatus()

const program = new Command()

program
  .name('file-stage')
  .description('CLI for ipfs-file-stager staging, downloads, and pin status.')

program.command('download-file')
  .description('Download a file from IPFS to the files/ directory. This is for files that have a valid Pin Claim.')
  .option('-c, --cid <string>', 'CID of the file to download')
  .action(downloadFile.run)

program.command('file-upload')
  .description('Upload a file from the files/ directory to ipfs-file-stager for staging')
  .option('-f, --filename <string>', 'File Name (required)')
  .action(ipfsFileUpload.run)

program.command('pin-status')
  .description('Get the pin-status of a CID')
  .option('-c, --cid <string>', 'CID of the file to get the pin-status of')
  .action(pinStatus.run)

program.command('pin-latest')
  .description('List latest pins from the staging service (paginated)')
  .option('-p, --page <number>', 'Page number', '1')
  .action(pinLatest.run)

program.parseAsync(process.argv)
