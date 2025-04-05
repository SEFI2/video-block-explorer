import * as dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";

dotenv.config();

// Function to mask sensitive data
function maskSensitiveData(value: string | undefined): string {
  if (!value) return "undefined";
  if (value.length > 8) {
    return value.substring(0, 4) + "..." + value.substring(value.length - 4);
  }
  return "***";
}

console.log("Deployment Environment Verification:");
console.log("-----------------------------------");

// Network info
console.log("\nNetwork Information:");
console.log("  Network: Celo Alfajores");
console.log("  Chain ID:", celoAlfajores.id);
console.log("  RPC URL:", process.env.ALFAJORES_URL);

// Account from private key
console.log("\nDeployment Account:");
const privateKey = process.env.PRIVATE_KEY || "";
if (!privateKey) {
  console.log("  ❌ PRIVATE_KEY is not set!");
} else {
  try {
    const account = privateKeyToAccount(`0x${privateKey}`);
    console.log("  Account Address:", account.address);
    
    // Don't show the actual private key, just indicate it was loaded
    console.log("  Private Key: Successfully loaded (masked)");
    
    // Output details about how it's used in hardhat.config.ts
    console.log("\nHow it's used in hardhat.config.ts:");
    console.log("  const PRIVATE_KEY = process.env.PRIVATE_KEY || \"0x000...\";");
    console.log("  networks: {");
    console.log("    alfajores: {");
    console.log("      url: process.env.ALFAJORES_URL || \"\",");
    console.log("      accounts: [PRIVATE_KEY],");
    console.log("      chainId: 44787");
    console.log("    }");
    console.log("  }");
  } catch (error) {
    console.log("  ❌ Error creating account from private key:", error);
  }
}

// Deployment process info
console.log("\nDeployment Process:");
console.log("  Command: npx hardhat run scripts/deploy-and-test-alfajores.ts --network alfajores");
console.log("  Script: scripts/deploy-and-test-alfajores.ts");
console.log("  Network Configuration: hardhat.config.ts -> networks.alfajores");

// Environment Variables Summary
console.log("\nEnvironment Variables:");
const envVars = {
  "ALFAJORES_URL": process.env.ALFAJORES_URL,
  "PRIVATE_KEY": privateKey ? "[MASKED]" : "Not set",
  "CELOSCAN_API_KEY": process.env.CELOSCAN_API_KEY ? "[MASKED]" : "Not set",
  "ALFAJORES_SCAN_API_URL": process.env.ALFAJORES_SCAN_API_URL,
  "ALFAJORES_SCAN_BROWSER_URL": process.env.ALFAJORES_SCAN_BROWSER_URL
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`  ${key}: ${value}`);
}

// Verification if all is set correctly
console.log("\nVerification Status:");
if (process.env.ALFAJORES_URL && privateKey) {
  console.log("  ✅ Basic deployment environment is correctly set up");
} else {
  console.log("  ❌ Missing required environment variables for deployment");
}

if (process.env.CELOSCAN_API_KEY && process.env.ALFAJORES_SCAN_API_URL) {
  console.log("  ✅ Contract verification environment is correctly set up");
} else {
  console.log("  ⚠️ Contract verification environment is not fully set up");
} 