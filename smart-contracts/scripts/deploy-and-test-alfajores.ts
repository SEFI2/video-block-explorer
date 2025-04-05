import { ethers } from "hardhat";
import { createPublicClient, createWalletClient, http, parseEther, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying and testing VideoReportNFT on Alfajores testnet...");

  // Deploy the contract using Hardhat
  const VideoReportNFT = await ethers.getContractFactory("VideoReportNFT");
  const videoReportNFT = await VideoReportNFT.deploy();
  await videoReportNFT.waitForDeployment();
  
  const contractAddress = await videoReportNFT.getAddress();
  console.log(`VideoReportNFT deployed to: ${contractAddress}`);

  // Set up viem clients for interacting with Alfajores
  const privateKey = process.env.PRIVATE_KEY || "";
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is required in your .env file");
  }

  const account = privateKeyToAccount(`0x${privateKey}`);
  
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http()
  });
  
  const walletClient = createWalletClient({
    account,
    chain: celoAlfajores,
    transport: http()
  });
  
  // Get contract ABI
  const contractAbi = (await import("../artifacts/contracts/VideoReportNFT.sol/VideoReportNFT.json")).abi;
  
  // Test minting a token
  console.log("Testing contract by minting a token...");
  
  const videoURI = "ipfs://QmExampleAlfajoresTest";
  
  try {
    // Get account balance before
    const balanceBefore = await publicClient.getBalance({
      address: account.address,
    });
    console.log(`Account balance before: ${balanceBefore} wei`);
    
    // Mint token transaction
    const { request } = await publicClient.simulateContract({
      address: contractAddress as Address,
      abi: contractAbi,
      functionName: "mintVideoToken",
      args: [account.address, videoURI],
      value: parseEther("0.01")
    });
    
    const txHash = await walletClient.writeContract(request);
    console.log(`Mint transaction hash: ${txHash}`);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get token data
    const tokenData = await publicClient.readContract({
      address: contractAddress as Address,
      abi: contractAbi,
      functionName: "getVideoData",
      args: [0n]  // First token has ID 0
    });
    
    console.log("Token data:", tokenData);
    
    // Verify token owner
    const tokenOwner = await publicClient.readContract({
      address: contractAddress as Address,
      abi: contractAbi,
      functionName: "ownerOf",
      args: [0n]
    }) as Address;
    
    console.log(`Token owner: ${tokenOwner}`);
    console.log(`Account address: ${account.address}`);
    console.log(`Owner matches account: ${tokenOwner.toLowerCase() === account.address.toLowerCase()}`);
    
    // Get contract balance
    const contractBalance = await publicClient.getBalance({
      address: contractAddress as Address,
    });
    console.log(`Contract balance: ${contractBalance} wei`);
    
    // Withdraw funds
    const { request: withdrawRequest } = await publicClient.simulateContract({
      address: contractAddress as Address,
      abi: contractAbi,
      functionName: "withdraw",
      account: account.address,
    });
    
    const withdrawTxHash = await walletClient.writeContract(withdrawRequest);
    console.log(`Withdraw transaction hash: ${withdrawTxHash}`);
    
    console.log("Waiting for withdraw transaction confirmation...");
    const withdrawReceipt = await publicClient.waitForTransactionReceipt({ hash: withdrawTxHash });
    console.log(`Withdraw transaction confirmed in block ${withdrawReceipt.blockNumber}`);
    
    // Verify contract balance is zero
    const contractBalanceAfter = await publicClient.getBalance({
      address: contractAddress as Address,
    });
    console.log(`Contract balance after withdraw: ${contractBalanceAfter} wei`);
    
    // Get account balance after
    const balanceAfter = await publicClient.getBalance({
      address: account.address,
    });
    console.log(`Account balance after: ${balanceAfter} wei`);
    
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 