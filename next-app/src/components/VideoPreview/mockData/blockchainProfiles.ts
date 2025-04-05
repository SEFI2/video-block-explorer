// Mock blockchain profile data for video demos

// Define a generic blockchain profile type
interface BlockchainProfile {
  userAddress: string;
  chainId: number;
  networkName: string;
  tokenBalance: string;
  transactionCount: number;
  nftCount: number;
  activeContracts: number;
  firstTransactionDate: string;
  generatedText: string;
  activity: BlockchainActivity; // Replace any with a more specific type
}

// Define a type for blockchain activity data
interface BlockchainActivity {
  transactions?: {
    sent: number;
    received: number;
    totalValue: string;
    recent: { hash: string; value: string; timestamp: number }[];
  };
  nfts?: {
    collections: string[];
    totalCount: number;
    topNft?: { collection: string; id: string; value: string };
  };
  contracts?: {
    interacted: string[];
    mostUsed: { address: string; name: string; interactionCount: number }[];
  };
}

// Default profiles for different demo types
const profiles: Record<string, BlockchainProfile> = {
  default: {
    userAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    tokenBalance: '5.43',
    transactionCount: 127,
    nftCount: 8,
    activeContracts: 12,
    firstTransactionDate: '2021-05-12',
    generatedText: `This is a demo blockchain activity profile for a standard Ethereum user. 
    
The wallet has been active for approximately 2 years and has made 127 transactions across 12 different smart contracts. Notable activity includes:
    
- Participation in DEX trading on Uniswap and Sushiswap
- Lending and borrowing activity on Aave and Compound
- NFT purchases from OpenSea and Rarible
- Staking ETH since the Beacon Chain launch

The wallet maintains a healthy balance of 5.43 ETH and has interacted with a varied set of DeFi protocols, showing a diverse interest in the Ethereum ecosystem.`,
    activity: {
      // Complex data structure would go here
    }
  },
  
  nft: {
    userAddress: '0x3B3525F60eeea4a1eF554df5425912c2a532875d',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    tokenBalance: '12.75',
    transactionCount: 368,
    nftCount: 87,
    activeContracts: 19,
    firstTransactionDate: '2020-08-23',
    generatedText: `This wallet is highly active in the NFT space with a collection of 87 NFTs across multiple marketplaces and collections.
    
Notable NFT collections in this wallet include:
    
- 3 Bored Ape Yacht Club NFTs
- 5 CryptoPunks
- 12 Art Blocks pieces
- 23 NFTs from emerging artists
- Multiple gaming NFTs including Axie Infinity and Gods Unchained cards

The wallet has spent approximately 47.3 ETH on NFT purchases over the past year, with the most expensive single purchase being 8.5 ETH for a rare CryptoPunk. The owner appears to be both a collector and occasional trader, having sold 12 NFTs for a total profit of 9.2 ETH.
    
Recent activity shows increased interest in generative art NFTs and music NFTs.`,
    activity: {
      // Complex data structure would go here
    }
  },
  
  defi: {
    userAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    tokenBalance: '32.4',
    transactionCount: 589,
    nftCount: 3,
    activeContracts: 47,
    firstTransactionDate: '2019-11-05',
    generatedText: `This wallet represents a sophisticated DeFi power user with extensive protocol usage across the Ethereum ecosystem.
    
Key DeFi activities:
    
- Provided liquidity on Uniswap, Curve, and Balancer with positions worth over 25 ETH
- Active borrowing and lending on Aave and Compound, managing collateralization ratios efficiently
- Participated in yield farming strategies across multiple protocols
- Governance participation in MakerDAO, Uniswap, and Compound with regular voting activity
- Advanced strategies including leveraged positions and flash loans

The wallet manages approximately $145,000 in total value locked across various protocols, with an estimated yearly yield of 12.7% on average. The user demonstrates sophisticated risk management by diversifying across lending platforms and maintaining healthy collateralization ratios.
    
Recent activity shows increased interest in Layer 2 DeFi platforms like Arbitrum and Optimism.`,
    activity: {
      // Complex data structure would go here
    }
  },
  
  gaming: {
    userAddress: '0x8F5536871D6c6771c0e9E9b997A4F60FDf5BFd01',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    tokenBalance: '3.21',
    transactionCount: 412,
    nftCount: 64,
    activeContracts: 22,
    firstTransactionDate: '2021-03-17',
    generatedText: `This wallet demonstrates significant activity in blockchain gaming ecosystems across multiple platforms.
    
Gaming profile highlights:
    
- Axie Infinity: Owns a team of 6 Axies, reached 2200+ MMR ranking
- The Sandbox: Owns 2 LAND parcels and has created 5 assets in the marketplace
- Decentraland: Frequents multiple venues and owns wearables
- Gods Unchained: Collection of 50+ cards including 3 legendary cards
- Illuvium: Early participant in land sale

The wallet has spent approximately 8.2 ETH on gaming assets and has earned roughly 2.3 ETH from play-to-earn activities. The user regularly participates in gaming DAOs and has voted on 7 different governance proposals.
    
Recent activity shows increased interest in metaverse projects and cross-game interoperability platforms.`,
    activity: {
      // Complex data structure would go here
    }
  },
  
  trader: {
    userAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    tokenBalance: '59.82',
    transactionCount: 873,
    nftCount: 5,
    activeContracts: 35,
    firstTransactionDate: '2018-07-29',
    generatedText: `This wallet exhibits the profile of a highly active cryptocurrency trader utilizing both centralized and decentralized exchanges.
    
Trading activity analysis:
    
- Over 750 trades executed in the past year
- Average position size: 2.3 ETH
- Preferred DEXs: Uniswap V3, dYdX, and 1inch
- Trading strategy shows a preference for momentum trading and range-bound strategies
- Successfully navigated recent market volatility with net positive returns

The wallet has generated approximately 37.4 ETH in trading profits over the past year, representing a 62% return on capital. The user demonstrates sophisticated trading behaviors including:
    
- Use of limit orders and range orders on Uniswap V3
- Perpetual futures trading on dYdX
- Flash swaps for arbitrage opportunities
- Regular rebalancing of positions

Trading patterns indicate a full-time trading focus with activity distributed throughout all hours of the day.`,
    activity: {
      // Complex data structure would go here
    }
  },
  
  staking: {
    userAddress: '0x3Dbe07088e154bPc55A8F2C85CbC73234DCAC067',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    tokenBalance: '128.5',
    transactionCount: 95,
    nftCount: 1,
    activeContracts: 8,
    firstTransactionDate: '2020-02-14',
    generatedText: `This wallet demonstrates a focused staking strategy with significant ETH allocated to various staking protocols.
    
Staking portfolio:
    
- 64 ETH staked directly in Ethereum 2.0 deposit contract (2 validators)
- 32 ETH in Lido liquid staking
- 16 ETH in Rocket Pool
- 8 ETH in Stakewise
- 8.5 ETH in various DeFi staking opportunities

The wallet has earned approximately 7.8 ETH in staking rewards over the past year, representing a 6.1% annual yield. The staking strategy demonstrates a preference for decentralization by distributing stakes across multiple protocols rather than concentrating in a single service.
    
The user has participated in governance votes for staking protocols, particularly on proposals related to reward distribution and protocol upgrades. Recent activity shows increased interest in liquid staking derivatives and their use in DeFi strategies.`,
    activity: {
      // Complex data structure would go here
    }
  }
};

// Function to get a blockchain profile by ID
export const getBlockchainProfile = (profileId?: string): BlockchainProfile => {
  // If a specific profile is requested and exists, return it
  if (profileId && profiles[profileId]) {
    return profiles[profileId];
  }
  
  // If it's a random ID or wallet address, generate a modified default profile
  if (profileId) {
    const seedNum = parseInt(profileId.slice(-8), 16) || 12345;
    const randomFactor = (seedNum % 1000) / 100;
    
    return {
      ...profiles.default,
      userAddress: `0x${profileId.padEnd(40, '0').slice(0, 40)}`,
      tokenBalance: (3 + randomFactor * 2).toFixed(2),
      transactionCount: Math.floor(50 + randomFactor * 100),
      nftCount: Math.floor(randomFactor * 10),
      activeContracts: Math.floor(5 + randomFactor * 8),
      generatedText: profiles.default.generatedText // Use the default text
    };
  }
  
  // Fallback to default profile
  return profiles.default;
};

export default profiles; 