import { ethers, run } from "hardhat";

async function main() {
  const contractAddress = "0x7bef418811f6b32b0eed9951dad5b7af8fbbbd52";
  console.log("Verifying contract on Celoscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      network: "celo",
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