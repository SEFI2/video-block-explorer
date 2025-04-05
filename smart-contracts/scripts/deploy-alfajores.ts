import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VideoReportNFT on Alfajores testnet...");

  // Deploy the contract using Hardhat
  const VideoReportNFT = await ethers.getContractFactory("VideoReportNFT");
  const videoReportNFT = await VideoReportNFT.deploy();
  await videoReportNFT.waitForDeployment();
  
  const contractAddress = await videoReportNFT.getAddress();
  console.log(`VideoReportNFT deployed to: ${contractAddress}`);
  console.log("Deployment successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 