import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
