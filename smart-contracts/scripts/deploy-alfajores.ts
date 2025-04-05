import { ethers, run } from "hardhat";

async function main() {
  console.log("Deploying VideoReportNFT on Alfajores testnet...");

  // Deploy the contract using Hardhat
  const VideoReportNFT = await ethers.getContractFactory("VideoReportNFT");
  const videoReportNFT = await VideoReportNFT.deploy();
  await videoReportNFT.waitForDeployment();
  
  const contractAddress = await videoReportNFT.getAddress();
  console.log(`VideoReportNFT deployed to: ${contractAddress}`);
  console.log("Deployment successful!");

  // Wait a bit for the transaction to be fully confirmed and indexed
  console.log("Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  // Verify the contract on the Celo Alfajores explorer
  console.log("Verifying contract on Celoscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      network: "alfajores",
      constructorArguments: []
    });
    console.log("Contract verification successful!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 