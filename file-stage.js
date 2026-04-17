/*
  This is the primary entry point for the psf-bch-wallet CLI app.
  This app uses commander.js.
*/

// Global npm libraries
import { Command } from 'commander'

// Local libraries
import WalletCreate from './src/commands/wallet-create.js'
import WalletList from './src/commands/wallet-list.js'
import WalletAddrs from './src/commands/wallet-addrs.js'
import WalletBalance from './src/commands/wallet-balance.js'
import SendBch from './src/commands/send-bch.js'
import SendTokens from './src/commands/send-tokens.js'
import WalletSweep from './src/commands/wallet-sweep.js'
import MsgSign from './src/commands/msg-sign.js'
import MsgVerify from './src/commands/msg-verify.js'
import IPFSStatus from './src/commands/ipfs-status.js'
import IPFSPeers from './src/commands/ipfs-peers.js'
import IPFSRelays from './src/commands/ipfs-relays.js'
import IPFSConnect from './src/commands/ipfs-connect.js'
import WalletService from './src/commands/wallet-service.js'
import DownloadFile from './src/commands/download-file.js'
import DownloadCid from './src/commands/download-cid.js'
import IPFSPinClaim from './src/commands/pin-claim.js'
import PinStatus from './src/commands/pin-status.js'
import PinRenew from './src/commands/pin-renew.js'
import UnprocessedPins from './src/commands/unprocessed-pins.js'
import IPFSRepin from './src/commands/reprocess.js'
import IPFSPinUpload from './src/commands/pin-upload.js'
import PinClaimFile from './src/commands/pin-claim-file.js'
import ConsumerTest from './src/commands/consumer-test.js'

// Instantiate the subcommands
const walletCreate = new WalletCreate()
const walletList = new WalletList()
const walletAddrs = new WalletAddrs()
const walletBalance = new WalletBalance()
const sendBch = new SendBch()
const sendTokens = new SendTokens()
const walletSweep = new WalletSweep()
const msgSign = new MsgSign()
const msgVerify = new MsgVerify()
const ipfsStatus = new IPFSStatus()
const ipfsPeers = new IPFSPeers()
const ipfsRelays = new IPFSRelays()
const ipfsConnect = new IPFSConnect()
const downloadFile = new DownloadFile()
const downloadCid = new DownloadCid()
const walletService = new WalletService()
const program = new Command()
const ipfsPinClaim = new IPFSPinClaim()
const pinStatus = new PinStatus()
const pinRenew = new PinRenew()
const unprocessedPins = new UnprocessedPins()
const ipfsRepin = new IPFSRepin()
const ipfsPinUpload = new IPFSPinUpload()
const pinClaimFile = new PinClaimFile()
const consumerTest = new ConsumerTest()

program
  // Define the psf-bch-wallet app options
  .name('psf-bch-wallet')
  .description('A command-line BCH and SLP token wallet.')

// Define the wallet-create command
program.command('wallet-create')
  .description('Create a new wallet with name (-n <name>) and description (-d)')
  .option('-n, --name <string>', 'wallet name')
  .option('-d --description <string>', 'what the wallet is being used for')
  .action(walletCreate.run)

// Define the wallet-list command
program.command('wallet-list')
  .description('List existing wallets')
  .action(walletList.run)

program.command('wallet-addrs')
  .description('List the different addresses for a wallet.')
  .option('-n, --name <string>', 'wallet name')
  .action(walletAddrs.run)

program.command('wallet-balance')
  .description('Get balances in BCH and SLP tokens held by the wallet.')
  .option('-n, --name <string>', 'wallet name')
  .action(walletBalance.run)

program.command('wallet-sweep')
  .description('Sweep funds from a WIF private key')
  .option('-n, --name <string>', 'wallet name receiving BCH')
  .option('-w, --wif <string>', 'WIF private key to sweep')
  .action(walletSweep.run)

program.command('send-bch')
  .description('Send BCH to an address')
  .option('-n, --name <string>', 'wallet name sending BCH')
  .option('-a, --addr <string>', 'address to send BCH to')
  .option('-q, --qty <string>', 'The quantity of BCH to send')
  .action(sendBch.run)

program.command('send-tokens')
  .description('Send SLP tokens to an address')
  .option('-n, --name <string>', 'wallet name sending BCH')
  .option('-a, --addr <string>', 'address to send BCH to')
  .option('-q, --qty <string>', 'The quantity of BCH to send')
  .option('-t, --tokenId <string>', 'The token ID of the token to send')
  .action(sendTokens.run)

program.command('msg-sign')
  .description('Sign a message using the wallets private key')
  .option('-n, --name <string>', 'wallet to sign the message')
  .option('-m, --msg <string>', 'Message to sign')
  .action(msgSign.run)

program.command('msg-verify')
  .description('Verify a signature')
  .option('-s, --sig <string>', 'Signature')
  .option('-m, --msg <string>', 'Cleartext message that was signed')
  .option('-a, --addr <string>', 'BCH address generated from private key that signed the message')
  .action(msgVerify.run)

program.command('ipfs-status')
  .description('Get ipfs node status')
  .action(ipfsStatus.run)

program.command('ipfs-peers')
  .description('Get ipfs node peers')
  .option('-a, --all', 'Display all data about peers')
  .action(ipfsPeers.run)

program.command('ipfs-relays')
  .description('Query the state of circuit relays')
  .action(ipfsRelays.run)

program.command('ipfs-connect')
  .description('Connect to an IPFS peer')
  .option('-m, --multiaddr <string>', 'Multiaddr of the peer to connect to')
  .option('-d, --details', 'Get details about the peer')
  .action(ipfsConnect.run)

program.command('download-file')
  .description('Download a file from IPFS to the files/ directory. This is for files that have a valid Pin Claim.')
  .option('-c, --cid <string>', 'CID of the file to download')
  .action(downloadFile.run)

program.command('download-cid')
  .description('Download a file from IPFS to the files/ directory. This is for files that have a valid Pin Claim.')
  .option('-c, --cid <string>', 'CID of the file to download')
  .option('-f, --filename <string>', 'File Name (required)')
  .action(downloadCid.run)

program.command('wallet-service')
  .description('Get information about the wallet service providers')
  .action(walletService.run)

program.command('pin-claim')
  .description('Trigger a pin claim for a given CID')
  .option('-p, --proofOfBurnTxid <string>', 'Proof of Burn TxId (required)')
  .option('-t, --claimTxid <string>', 'Claim TxId (required)')
  .option('-f, --filename <string>', 'File Name (required)')
  .option('-a, --address <string>', 'Address to claim the pin to (required)')
  .option('-c, --cid <string>', 'CID of the file (required)')
  .action(ipfsPinClaim.run)

program.command('pin-status')
  .description('Get the pin-status of a CID')
  .option('-c, --cid <string>', 'CID of the file to get the pin-status of')
  .action(pinStatus.run)

program.command('pin-renew')
  .description('Renew an expired pin claim for a CID')
  .option('-c, --cid <string>', 'CID of the file to renew')
  .option('-n, --name <string>', 'wallet name to pay for renewal')
  .action(pinRenew.run)

program.command('unprocessed-pins')
  .description('Get all DB entries with a validClaim property of null.')
  .action(unprocessedPins.run)

program.command('reprocess')
  .description('Repin a CID if it has a validClaim property of null.')
  .option('-c, --cid <string>', 'CID of the file to repin')
  .action(ipfsRepin.run)
program.command('pin-upload')
  .description('Upload and pin a file to IPFS')
  .option('-f, --filename <string>', 'File Name (required)')
  .action(ipfsPinUpload.run)

program.command('pin-claim-file')
  .description('Upload a file to IPFS and generate a Pin Claim on the BCH blockchain')
  .option('-f, --filename <string>', 'File Name in the files/ directory (required)')
  .option('-n, --name <string>', 'Wallet name to pay for the pin claim (required)')
  .action(pinClaimFile.run)

program.command('consumer-test')
  .description('Test the consumer services')
  .action(consumerTest.run)

program.parseAsync(process.argv)
