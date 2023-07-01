import "@nomicfoundation/hardhat-toolbox";
import "./tasks/account";
import "./tasks/verify";
import "./tasks/balances";
import "./tasks/faucet";
import "./tasks/deploy";
import "./tasks/withdraw";
import "./tasks/send";
import "./tasks/mint";
import "./tasks/transfer";

import { getHardhatConfigNetworks } from "@zetachain/addresses-tools/dist/networks";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();
const PRIVATE_KEYS =
  process.env.PRIVATE_KEY !== undefined ? [`0x${process.env.PRIVATE_KEY}`] : [];

const config: HardhatUserConfig = {
  networks: {
    ...getHardhatConfigNetworks(PRIVATE_KEYS),
    "bsc-testnet": {
      ...getHardhatConfigNetworks(PRIVATE_KEYS)["bsc-testnet"], // Copy existing settings
      gas: 20000000000000000000, // Set the desired gas limit
      gasPrice: 20000000000000000000, // Set the desired gas limit
      initialBaseFeePerGas: 20000000000000000000,
      minGasPrice: 20000000000000000000,
      url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
    },
    // goerli: {
    //   ...getHardhatConfigNetworks(PRIVATE_KEYS)["goerli"], // Copy existing settings
    //   gas: 20000000, // Set the desired gas limit //20000000000000000 //20000000
    //   url: `https://eth-goerli.g.alchemy.com/v2/5kJ19pS_d17Gf4Cj8Y7Rcu69MSZRZlYF`,
    // },
    // "polygon-mumbai": {
    //   ...getHardhatConfigNetworks(PRIVATE_KEYS)["polygon-mumbai"], // Copy existing settings
    //   gas: 20000000000000000, // Set the desired gas limit //20000000000000000 //20000000
    // },
  },
  solidity: "0.8.7",
};

export default config;
