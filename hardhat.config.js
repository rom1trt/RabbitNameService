require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const { ALCHEMY_API, PRIVATE_KEY } = process.env;

module.exports = {
  defaultNetwork: "amoy",
  networks: {
    hardhat: {
    },
    amoy: {
      chainId: 0x13882,
      url: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API}`,
      accounts: [PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 40000
  }
}