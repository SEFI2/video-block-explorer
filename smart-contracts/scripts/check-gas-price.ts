import { ethers } from "hardhat";

async function main() {
  console.log("Checking current gas price on Alfajores...");
  
  const provider = new ethers.JsonRpcProvider(process.env.ALFAJORES_URL);
  
  const feeData = await provider.getFeeData();
  console.log("Gas price (gwei):", ethers.formatUnits(feeData.gasPrice || 0, "gwei"));
  
  if (feeData.maxFeePerGas) {
    console.log("Max fee per gas (gwei):", ethers.formatUnits(feeData.maxFeePerGas, "gwei"));
  }
  
  if (feeData.maxPriorityFeePerGas) {
    console.log("Max priority fee per gas (gwei):", ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei"));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 