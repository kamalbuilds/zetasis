require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "mantle",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  networks: {
    mantle: {
      url: "https://rpc.testnet.mantle.xyz/",
      accounts: [process.env.PRIV_KEY], // Uses the private key from the .env file
    },
  },
};
