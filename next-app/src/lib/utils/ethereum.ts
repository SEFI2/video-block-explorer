import { ethers } from 'ethers';

// ABI of your Ethereum contract
// Replace with your actual contract ABI
// Define a more specific type for contract ABI
type ContractFunction = {
  type: string;
  name?: string;
  inputs?: { name: string; type: string; internalType?: string }[];
  outputs?: { name: string; type: string; internalType?: string }[];
  stateMutability?: string;
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
};

const contractABI: ContractFunction[] = [
  // Add your contract ABI here
];

let provider: ethers.JsonRpcProvider;
let contract: ethers.Contract;
let wallet: ethers.Wallet;

// Initialize provider based on environment
export const getProvider = () => {
  if (!provider) {
    const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL;
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
};

// Initialize contract instance
export const getContract = () => {
  if (!contract) {
    const provider = getProvider();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    contract = new ethers.Contract(contractAddress!, contractABI, provider);
  }
  return contract;
};

// Initialize wallet for signing transactions (server-side only)
export const getWallet = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Wallet should only be accessed server-side');
  }
  
  if (!wallet) {
    const provider = getProvider();
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    wallet = new ethers.Wallet(privateKey!, provider);
  }
  return wallet;
};

// Get contract with signer for backend operations
export const getSignedContract = () => {
  const contract = getContract();
  const wallet = getWallet();
  return contract.connect(wallet);
}; 