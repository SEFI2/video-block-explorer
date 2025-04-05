import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  useCurrentFrame, 
  useVideoConfig
  // The following imports are commented out but kept for future use
  // Img,
  // staticFile,
  // Audio
} from 'remotion';
import { TransactionScene } from './TransactionScene';
import { ContractScene } from './ContractScene';
import { IntroScene } from './IntroScene';
import { OutroScene } from './OutroScene';
import { TextOverlay } from './TextOverlay';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

interface Contract {
  address: string;
  name: string;
  interactionCount: number;
}

// Define the structure from BlockchainProfile that we need
interface BlockchainProfile {
  userAddress: string;
  generatedText: string;
  chainId?: number;
  networkName?: string;
  tokenBalance?: string;
  transactionCount?: number;
  nftCount?: number;
  activeContracts?: number;
  firstTransactionDate?: string;
  activity?: unknown;
}

// Updated VideoPreviewProps to accept either detailed structure or BlockchainProfile
interface VideoPreviewProps {
  videoData: {
    userAddress: string;
    generatedText: string;
    transactions?: Transaction[];
    contracts?: Contract[];
    totalValue?: string;
  } | BlockchainProfile;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoData }) => {
  // These hooks are required by Remotion's rendering system
  useCurrentFrame(); // Required by Remotion but not directly used here
  const { fps } = useVideoConfig(); // We only use fps from this hook
  
  // Create mock data if we're using a BlockchainProfile that doesn't have transactions/contracts
  const transactions = 'transactions' in videoData && videoData.transactions 
    ? videoData.transactions 
    : createMockTransactions(videoData.userAddress);

  const contracts = 'contracts' in videoData && videoData.contracts
    ? videoData.contracts
    : createMockContracts();
    
  const totalValue = 'totalValue' in videoData && videoData.totalValue
    ? videoData.totalValue
    : 'tokenBalance' in videoData && videoData.tokenBalance 
      ? `${videoData.tokenBalance} ETH`
      : '0.0 ETH';
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {/* Background music */}
      {/* Commented out to avoid missing file error */}
      {/* <Audio src={staticFile('background.mp3')} /> */}
      
      {/* Intro Scene - 5 seconds */}
      <Sequence from={0} durationInFrames={5 * fps}>
        <IntroScene userAddress={videoData.userAddress} />
      </Sequence>
      
      {/* Transaction Overview - 5 seconds */}
      <Sequence from={5 * fps} durationInFrames={5 * fps}>
        <TransactionScene 
          transactions={transactions} 
          totalValue={totalValue}
        />
      </Sequence>
      
      {/* Contract Interactions - 5 seconds */}
      <Sequence from={10 * fps} durationInFrames={5 * fps}>
        <ContractScene contracts={contracts} />
      </Sequence>
      
      {/* Outro Scene - 5 seconds */}
      <Sequence from={15 * fps} durationInFrames={5 * fps}>
        <OutroScene userAddress={videoData.userAddress} />
      </Sequence>
      
      {/* Text Overlay throughout video */}
      <TextOverlay text={videoData.generatedText} />
    </AbsoluteFill>
  );
};

// Helper function to create mock transactions if not provided
function createMockTransactions(address: string): Transaction[] {
  return Array.from({ length: 5 }, (_, i) => ({
    hash: `0x${i}${'0'.repeat(63)}`,
    from: i % 2 === 0 ? address : `0x${'a'.repeat(40)}`,
    to: i % 2 === 0 ? `0x${'b'.repeat(40)}` : address,
    value: (i * 0.01).toString(),
    timestamp: Date.now() - i * 86400000
  }));
}

// Helper function to create mock contracts if not provided
function createMockContracts(): Contract[] {
  return [{
    address: `0x${'c'.repeat(40)}`,
    name: 'Mock Contract',
    interactionCount: 3
  }];
} 