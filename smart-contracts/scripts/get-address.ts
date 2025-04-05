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
  console.log(wallet.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 