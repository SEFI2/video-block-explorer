'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faChartLine, 
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { getBlockchainProfile } from '../../remotion/blockchainProfiles';
import { TransactionRangeReport } from '@/types/report';
import Link from 'next/link';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { VideoPreview } from '@/remotion/MyVideo';

// Map of demo types to their descriptions and icons
const demoTypes = {
  default: { 
    name: 'Default Profile', 
    description: 'A standard mixed-use blockchain wallet with moderate activity across DeFi and NFTs',
    icon: faWallet,
    color: 'linear-gradient(90deg, #6D28D9 0%, #4F46E5 100%)'
  },
  nft: { 
    name: 'NFT Collector', 
    description: 'A wallet heavily involved in NFT collecting and trading across multiple marketplaces',
    icon: faWallet,
    color: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
  },
  defi: { 
    name: 'DeFi Power User', 
    description: 'An advanced user interacting with multiple DeFi protocols for lending, trading, and liquidity provision',
    icon: faWallet,
    color: 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
  },
  gaming: { 
    name: 'Gaming Profile', 
    description: 'A wallet focused on blockchain gaming across different platforms',
    icon: faWallet,
    color: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
  },
  trader: { 
    name: 'Trader Profile', 
    description: 'An active cryptocurrency trader using both centralized and decentralized exchanges',
    icon: faChartLine,
    color: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
  },
  staking: { 
    name: 'Staking Profile', 
    description: 'A long-term holder focused on staking ETH across multiple protocols',
    icon: faWallet,
    color: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)'
  }
};

// Type for the blockchain profile data
interface BlockchainProfileData {
  userAddress: string;
  chainId: number;
  networkName: string;
  tokenBalance: string;
  transactionCount: number;
  reports: TransactionRangeReport[];
  generatedText: string;
}

// Ultra simple component for testing Remotion context
const TestComponent: React.FC<{text: string}> = ({text}) => {
  const config = useVideoConfig();
  console.log('TestComponent videoConfig:', config);
  
  return (
    <AbsoluteFill style={{backgroundColor: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <h1 style={{fontSize: '3rem'}}>{text}</h1>
    </AbsoluteFill>
  );
};

// Simple video component that doesn't use transitions
const SimpleBlockchainVideo: React.FC<BlockchainProfileData> = (props) => {
  const config = useVideoConfig();
  console.log('SimpleBlockchainVideo videoConfig:', config);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', color: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Blockchain Analytics</h1>
      <div style={{ overflow: 'auto', height: '100%' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>User: {props.userAddress}</h2>
        <p>Network: {props.networkName}</p>
        <p>Balance: {props.tokenBalance} ETH</p>
        <p>Transaction Count: {props.transactionCount}</p>
        
        <h3 style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Summary</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{props.generatedText}</p>
      </div>
    </AbsoluteFill>
  );
};

export const MockVideoPlayer = () => {
  // Get blockchain profile data based on demoId
  const profileData = getBlockchainProfile();
  
  // Log the profile data to help with debugging
  useEffect(() => {
    console.log('Profile data:', profileData);
  }, [profileData]);



  return (
    <div className="video-player-container card-gradient animate-slide-up">
      <h1 className="text-2xl font-bold mb-4">Blockchain Analytics Video</h1>

      
      <div className="card card-dark glow-border mb-4" style={{maxWidth: '800px', margin: '0 auto', overflow: 'hidden'}}>
      <Player
          component={VideoPreview}
          inputProps={{props: profileData}}
          durationInFrames={20 * 30}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          controls
          style={{ 
            width: '100%', 
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden' 
          }}
          acknowledgeRemotionLicense={true}
        />
      </div>
      
      <div className="video-text-content card-glass" style={{maxWidth: '800px', margin: '0 auto'}}>
        <h3 className="text-xl font-semibold p-3 pb-0">Generated Script</h3>
        <pre className="p-3 glass" style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-family)',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-md)'
        }}>
          {profileData.generatedText}
        </pre>
      </div>
    </div>
  );
}; 

export default function MockVideoPage() {
  return <MockVideoPlayer />;
} 