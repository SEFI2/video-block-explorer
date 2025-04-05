import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("PRIVATE_KEY not found in .env file");
    return;
  }
  
  const wallet = new ethers.Wallet(privateKey);
  console.log("Checking balance for wallet address:", wallet.address);
  
  const provider = new ethers.JsonRpcProvider(process.env.ALFAJORES_URL);
  const balance = await provider.getBalance(wallet.address);
  
  console.log("Balance:", ethers.formatEther(balance), "CELO");
  console.log("Balance in wei:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 