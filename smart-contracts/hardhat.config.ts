import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    alfajores: {
      url: process.env.ALFAJORES_URL || "",
      accounts: [PRIVATE_KEY],
      chainId: 44787,
      gasPrice: 30000000000, // 30 gwei (current is 25 gwei)
      gas: 2100000 // Lower gas limit
    }
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: process.env.ALFAJORES_SCAN_API_URL || "",
          browserURL: process.env.ALFAJORES_SCAN_BROWSER_URL || ""
        }
      }
    ]
  }
};

export default config;
