import config from "../hardhat.config";
import * as dotenv from "dotenv";
import { HardhatEtherscanConfig } from "hardhat/types";

dotenv.config();

// Function to mask sensitive data
function maskSensitiveData(value: string | undefined): string {
  if (!value) return "undefined";
  if (value.length > 8) {
    return value.substring(0, 4) + "..." + value.substring(value.length - 4);
  }
  return "***";
}

console.log("Hardhat Configuration Check:");
console.log("-----------------------------");

// Check solidity version
console.log("Solidity Version:", config.solidity);

// Check networks configuration
console.log("\nNetworks Configuration:");

// Check Alfajores network config
if (config.networks && config.networks.alfajores) {
  const alfajores = config.networks.alfajores;
  console.log("  Alfajores:");
  console.log("    URL:", alfajores.url);
  console.log("    ChainID:", alfajores.chainId);
  console.log("    Accounts length:", (alfajores.accounts as string[])?.length || 0);
  
  if (Array.isArray(alfajores.accounts) && alfajores.accounts.length > 0) {
    // Safely mask the private key if it's available
    const key = alfajores.accounts[0];
    console.log("    First account:", typeof key === 'string' ? maskSensitiveData(key) : "Not a string");
  }
} else {
  console.log("  Alfajores network not configured!");
}

// Check Etherscan configuration
console.log("\nEtherscan Configuration:");
if (config.etherscan) {
  if (typeof config.etherscan.apiKey === 'object') {
    console.log("  API Keys:");
    for (const [network, key] of Object.entries(config.etherscan.apiKey)) {
      console.log(`    ${network}: ${maskSensitiveData(key as string)}`);
    }
  } else if (typeof config.etherscan.apiKey === 'string') {
    console.log(`  API Key: ${maskSensitiveData(config.etherscan.apiKey)}`);
  }
  
  if (config.etherscan.customChains) {
    console.log("  Custom Chains:");
    for (const chain of config.etherscan.customChains) {
      console.log(`    ${chain.network} (Chain ID: ${chain.chainId}):`);
      console.log(`      API URL: ${chain.urls.apiURL}`);
      console.log(`      Browser URL: ${chain.urls.browserURL}`);
    }
  }
} else {
  console.log("  Etherscan not configured!");
}

// Compare env vars with hardhat config
console.log("\nVerifying config matches environment variables:");

const alfajoresUrl = config.networks?.alfajores?.url;
if (alfajoresUrl === process.env.ALFAJORES_URL) {
  console.log("✅ ALFAJORES_URL correctly used in config");
} else {
  console.log("❌ ALFAJORES_URL mismatch:");
  console.log(`  Env: ${process.env.ALFAJORES_URL}`);
  console.log(`  Config: ${alfajoresUrl}`);
}

const apiKey = typeof config.etherscan?.apiKey === 'object' ? 
  config.etherscan?.apiKey.alfajores : 
  config.etherscan?.apiKey;

if (apiKey === process.env.CELOSCAN_API_KEY) {
  console.log("✅ CELOSCAN_API_KEY correctly used in config");
} else {
  console.log("❌ CELOSCAN_API_KEY mismatch:");
  console.log(`  Env: ${maskSensitiveData(process.env.CELOSCAN_API_KEY)}`);
  console.log(`  Config: ${maskSensitiveData(apiKey as string)}`);
}

// Check custom chain URLs
const customChain = config.etherscan?.customChains?.find(chain => chain.network === 'alfajores');
if (customChain) {
  if (customChain.urls.apiURL === process.env.ALFAJORES_SCAN_API_URL) {
    console.log("✅ ALFAJORES_SCAN_API_URL correctly used in config");
  } else {
    console.log("❌ ALFAJORES_SCAN_API_URL mismatch:");
    console.log(`  Env: ${process.env.ALFAJORES_SCAN_API_URL}`);
    console.log(`  Config: ${customChain.urls.apiURL}`);
  }

  if (customChain.urls.browserURL === process.env.ALFAJORES_SCAN_BROWSER_URL) {
    console.log("✅ ALFAJORES_SCAN_BROWSER_URL correctly used in config");
  } else {
    console.log("❌ ALFAJORES_SCAN_BROWSER_URL mismatch:");
    console.log(`  Env: ${process.env.ALFAJORES_SCAN_BROWSER_URL}`);
    console.log(`  Config: ${customChain.urls.browserURL}`);
  }
} 