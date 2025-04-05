import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Function to mask sensitive data
function maskSensitiveData(value: string | undefined): string {
  if (!value) return "undefined";
  if (value.length > 8) {
    return value.substring(0, 4) + "..." + value.substring(value.length - 4);
  }
  return "***";
}

// Check and display environment variables
console.log("Environment Variables Check:");
console.log("-----------------------------");

// Network URLs
console.log("ALFAJORES_URL:", process.env.ALFAJORES_URL || "Not set");

// API Keys (masked)
console.log("CELOSCAN_API_KEY:", maskSensitiveData(process.env.CELOSCAN_API_KEY));

// Private Key (masked)
console.log("PRIVATE_KEY:", maskSensitiveData(process.env.PRIVATE_KEY));

// Scan URLs
console.log("ALFAJORES_SCAN_API_URL:", process.env.ALFAJORES_SCAN_API_URL || "Not set");
console.log("ALFAJORES_SCAN_BROWSER_URL:", process.env.ALFAJORES_SCAN_BROWSER_URL || "Not set");

// Check if all required variables are set
const requiredVars = [
  "ALFAJORES_URL",
  "CELOSCAN_API_KEY",
  "PRIVATE_KEY",
  "ALFAJORES_SCAN_API_URL",
  "ALFAJORES_SCAN_BROWSER_URL"
];

let allVarsSet = true;
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.log(`❌ ${varName} is not set!`);
    allVarsSet = false;
  }
}

if (allVarsSet) {
  console.log("✅ All required environment variables are set.");
}

// Check if private key is properly formatted
const privateKey = process.env.PRIVATE_KEY;
if (privateKey) {
  if (privateKey.startsWith("0x")) {
    console.log("⚠️ Warning: PRIVATE_KEY should not include '0x' prefix");
  } else if (privateKey.length !== 64) {
    console.log("⚠️ Warning: PRIVATE_KEY length is unexpected (should be 64 characters without 0x prefix)");
  } else {
    console.log("✅ PRIVATE_KEY format appears correct");
  }
} 