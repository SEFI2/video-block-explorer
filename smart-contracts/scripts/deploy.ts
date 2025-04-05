import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VideoReportNFT contract...");

  const VideoReportNFT = await ethers.getContractFactory("VideoReportNFT");
  const videoReportNFT = await VideoReportNFT.deploy();

  await videoReportNFT.waitForDeployment();
  
  const address = await videoReportNFT.getAddress();
  console.log(`VideoReportNFT deployed to: ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 