/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

require("dotenv").config();
const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = process.env.MNEMONIC
const infuraApiKey = process.env.INFURA_APIKEY
// const moralisApiKey = fs.readFileSync(".moralisApiKey").toString().trim();
// const snowtraceApiKey = fs.readFileSync(".snowtraceApiKey").toString().trim();

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
  plugins: ["truffle-plugin-verify"],
  // api_keys: {
  //   snowtrace: snowtraceApiKey
  // },
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      websockets: true        // Enable EventEmitter interface for web3 (default: false)
    },
    ropsten: {
      provider: () => new HDWalletProvider( mnemonic, `https://ropsten.infura.io/v3/${infuraApiKey}` ),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    goerli: {
      provider: () => new HDWalletProvider( mnemonic, `https://goerli.infura.io/v3/${infuraApiKey}` ),
      network_id: 5,       // Goerli's id
      gas: 4465030,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    mumbai: {
      provider: () => new HDWalletProvider( mnemonic, `https://polygon-mumbai.infura.io/v3/${infuraApiKey}` ),
      network_id: 80001,
      gas: 18806140,
      gasPrice: 50000000000,
      confirmations: 2,
      skipDryRun: true,
    },
    polygon: {
      provider: () => new HDWalletProvider( mnemonic, `https://polygon-mainnet.infura.io/v3/${infuraApiKey}` ),
      network_id: 137,
      gasPrice: 40000000000,
      confirmations: 2,
      skipDryRun: true,
    },
    // avalanche_fuji: {
    //   provider: () => new HDWalletProvider( mnemonic, `https://speedy-nodes-nyc.moralis.io/${moralisApiKey}/avalanche/testnet` ),
    //   network_id: 43113,
    //   gas: 3000000,
    //   gasPrice: 225000000000,
    //   confirmations: 2,
    //   skipDryRun: true,
    // },
    // snow_fuji: {
    //   provider: () => new HDWalletProvider( mnemonic, `https://api.avax-test.network/ext/bc/C/rpc` ),
    //   network_id: 43113,
    //   timeoutBlocks: 200,
    //   confirmations: 2
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
    useColors: true
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.7",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },
};
