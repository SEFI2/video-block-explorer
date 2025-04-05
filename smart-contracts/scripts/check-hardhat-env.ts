import * as dotenv from "dotenv";

dotenv.config();

// Function to mask sensitive data
function maskSensitiveData(value: string | undefined): string {
  if (!value) return "undefined";
  if (value.length > 8) {
    return value.substring(0, 4) + "..." + value.substring(value.length - 4);
  }
  return "***";
}

console.log("Checking Hardhat Environment Variables:");
console.log("---------------------------------------");

// Network URLs
console.log("\nNetwork URLs:");
console.log("  ALFAJORES_URL:", process.env.ALFAJORES_URL || "Not set");

// Private Key
console.log("\nPrivate Key:");
const privateKey = process.env.PRIVATE_KEY;
if (privateKey) {
  console.log("  PRIVATE_KEY:", maskSensitiveData(privateKey));
  
  // Validate private key format
  if (privateKey.startsWith("0x")) {
    console.log("  ⚠️ Warning: PRIVATE_KEY should not include '0x' prefix");
  } else if (privateKey.length !== 64) {
    console.log(`  ⚠️ Warning: PRIVATE_KEY length is ${privateKey.length} (should be 64 characters without 0x prefix)`);
  } else {
    console.log("  ✅ PRIVATE_KEY format appears correct");
  }
  
  // Verify the key can be loaded (simple check without exposing the key)
  try {
    // Simple validation by checking if it's a valid hex string
    if (/^[0-9a-f]{64}$/i.test(privateKey)) {
      console.log("  ✅ PRIVATE_KEY is a valid hex string");
    } else {
      console.log("  ❌ PRIVATE_KEY is not a valid hex string");
    }
  } catch (error) {
    console.log("  ❌ PRIVATE_KEY could not be validated:", error);
  }
} else {
  console.log("  ❌ PRIVATE_KEY is not set!");
}

// Etherscan/Celoscan API Keys
console.log("\nAPI Keys:");
console.log("  CELOSCAN_API_KEY:", maskSensitiveData(process.env.CELOSCAN_API_KEY));

// Scan URLs
console.log("\nScan URLs:");
console.log("  ALFAJORES_SCAN_API_URL:", process.env.ALFAJORES_SCAN_API_URL || "Not set");
console.log("  ALFAJORES_SCAN_BROWSER_URL:", process.env.ALFAJORES_SCAN_BROWSER_URL || "Not set");

// Check for deprecated or unused variables
console.log("\nDeprecated or Unused Variables Check:");
const deprecatedVars = ["SEPOLIA_URL", "ETHERSCAN_API_KEY"];
for (const varName of deprecatedVars) {
  if (process.env[varName]) {
    console.log(`  ⚠️ Warning: ${varName} is set but may not be used in current configuration`);
  }
}

// Summary
console.log("\nSummary:");
const requiredVars = [
  "ALFAJORES_URL", 
  "PRIVATE_KEY", 
  "CELOSCAN_API_KEY",
  "ALFAJORES_SCAN_API_URL",
  "ALFAJORES_SCAN_BROWSER_URL"
];

let missingVars = 0;
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.log(`  ❌ ${varName} is not set!`);
    missingVars++;
  }
}

if (missingVars === 0) {
  console.log("  ✅ All required environment variables for Alfajores deployment are set.");
} else {
  console.log(`  ❌ ${missingVars} required environment variables are missing.`);
} 