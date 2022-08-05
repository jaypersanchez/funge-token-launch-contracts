require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require('@nomicfoundation/hardhat-toolbox')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task("balance", "Prints an account's balance").setAction(async () => {});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545`,
    },
    matic: {
      url: process.env.ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    bscscan: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts: [`de2087712bcf36bd5a39ac98b3c622c57f8625b42f4919888a97aac501b2120a`],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts: [`9ae393df5352ac05fc83cdca57a9302f3276537862c27856d0136a56dfa7cb7d`],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts: [`9ae393df5352ac05fc83cdca57a9302f3276537862c27856d0136a56dfa7cb7d`]
    },
    fuji: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      accounts: [`de2087712bcf36bd5a39ac98b3c622c57f8625b42f4919888a97aac501b2120a`],
    },
    avalanche: {
      url: `https://api.avax.network/ext/bc/C/rpc`,
      accounts: [`de2087712bcf36bd5a39ac98b3c622c57f8625b42f4919888a97aac501b2120a`]
    },
  },
  etherscan: {
    apiKey: "5573EP51U35FDS837XT1AMD5I7QWQJ2PZ5", // etherscan
    // apiKey: "Z7ICD5QD8WJ3MGAF7PA7WBKV2YUBHU67M3",
    additionalNetworks: {
        polygon: "WZB1DPUWYZ13SQSGHFTTEY43YJYAEFY2EH",
        polygonMumbai: "WZB1DPUWYZ13SQSGHFTTEY43YJYAEFY2EH",
        bsc: 'A2HNWK3VKZNQFAGU254HW1DAG4RPB8FI8T',
       // avalanche
       avalanche: "Z7ICD5QD8WJ3MGAF7PA7WBKV2YUBHU67M3",
       avalancheFujiTestnet: "Z7ICD5QD8WJ3MGAF7PA7WBKV2YUBHU67M3",
    }
  }
};
