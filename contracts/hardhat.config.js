require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    xdc: {
      url: process.env.XDC_RPC_URL || "https://rpc.xinfin.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 50,
    },
    xdcTestnet: {
      url: process.env.XDC_TESTNET_RPC_URL || "https://rpc.apothem.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 51,
    },
  },
  etherscan: {
    apiKey: {
      xdc: process.env.XDC_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "xdc",
        chainId: 50,
        urls: {
          apiURL: "https://xdc.blocksscan.io/api",
          browserURL: "https://xdc.blocksscan.io",
        },
      },
    ],
  },
};

