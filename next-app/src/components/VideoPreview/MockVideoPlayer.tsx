import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { VideoPreview } from './index';
import { useRouter, useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faChartLine, 
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { getBlockchainProfile } from './mockData/blockchainProfiles';
import Link from 'next/link';

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

export const MockVideoPlayer: React.FC<{
  demoId?: string; // Accept demoId as a prop for client components
}> = ({ demoId: propDemoId }) => {
  const router = useRouter(); // Replace useNavigate with useRouter
  const params = useParams(); // Next.js useParams
  
  // Get demoId from either props or params
  const demoId = propDemoId || (params?.demoId as string);
  
  const [title, setTitle] = useState('Blockchain Activity Video Preview');
  const [inputId, setInputId] = useState('');
  
  // Get the demo type info based on demoId
  const getDemoTypeInfo = (id?: string) => {
    if (!id) return demoTypes.default;
    if (id in demoTypes) return demoTypes[id as keyof typeof demoTypes];
    
    // If it's a numeric ID, it's a custom profile
    if (/^\d+$/.test(id)) {
      return {
        name: `Custom Profile #${id}`,
        description: 'A custom blockchain profile generated based on the provided ID',
        icon: faWallet,
        color: 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%)'
      };
    }
    
    // If it looks like a wallet address
    if (/^[0-9a-fA-F]+$/.test(id)) {
      return {
        name: 'Wallet Profile',
        description: 'A blockchain profile for the specified wallet address',
        icon: faWallet,
        color: 'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)'
      };
    }
    
    return demoTypes.default;
  };
  
  // Get demo type info
  const demoInfo = getDemoTypeInfo(demoId);
  
  // Handle form submission to navigate to the specified demo ID
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId.trim()) {
      router.push(`/demo/${inputId.trim()}`); // Use router.push instead of navigate
    }
  };
  
  useEffect(() => {
    // If we have a demoId, customize the title
    if (demoId) {
      // Special titles for the predefined profiles
      if (demoId === 'nft') {
        setTitle('NFT Collector Analytics Demo');
      } else if (demoId === 'defi') {
        setTitle('DeFi Power User Analytics Demo');
      } else if (demoId === 'gaming') {
        setTitle('Blockchain Gaming Profile Demo');
      } else if (demoId === 'trader') {
        setTitle('Cryptocurrency Trader Analytics Demo');
      } else if (demoId === 'staking') {
        setTitle('ETH Staking Analytics Demo');
      } else {
        setTitle(`Demo Video #${demoId} - Blockchain Analytics`);
      }
      console.log(`Loading demo video with ID: ${demoId}`);
    }
  }, [demoId]);

  // Get blockchain profile data based on demoId
  const videoData = getBlockchainProfile(demoId);

  console.log("MockVideoPlayer rendering with profile:", demoId || 'default');

  return (
    <div className="video-player-container card-gradient animate-slide-up">
      <h2 className="text-center mb-3 neon-text">
        <FontAwesomeIcon icon={faVideo} className="mr-2" />
        {title}
      </h2>
      
      {/* Profile Info Banner */}
      <div className="profile-info-banner mb-4" style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: demoInfo.color,
        borderRadius: '8px',
        padding: '16px 20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
      }}>
        <div className="profile-icon" style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          <FontAwesomeIcon icon={demoInfo.icon} />
        </div>
        <div className="profile-details">
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {demoInfo.name}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
            {demoInfo.description}
          </p>
          {demoId && (
            <div className="wallet-address" style={{
              fontSize: '0.8rem',
              marginTop: '5px',
              opacity: 0.8,
              fontFamily: 'monospace'
            }}>
              Wallet: {videoData.userAddress}
            </div>
          )}
        </div>
      </div>
      
      {/* Demo ID Input Form */}
      <div className="mb-4" style={{maxWidth: '800px', margin: '0 auto'}}>
        <div className="sample-profiles-container" style={{
          background: 'linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(56,189,248,0.2) 100%)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <div className="text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
            Try our sample blockchain profiles:
          </div>
          <div className="sample-buttons flex justify-center gap-3 flex-wrap">
            <Link 
              href="/demo/nft" 
              className="btn-sample" 
              style={{
                background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="mr-1">🖼️</span> NFT Collector
            </Link>
            <Link 
              href="/demo/defi" 
              className="btn-sample" 
              style={{
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="mr-1">💰</span> DeFi Power User
            </Link>
            <Link 
              href="/demo/gaming" 
              className="btn-sample" 
              style={{
                background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="mr-1">🎮</span> Gaming Profile
            </Link>
            <Link 
              href="/demo/trader" 
              className="btn-sample" 
              style={{
                background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="mr-1">📈</span> Trader
            </Link>
            <Link 
              href="/demo/staking" 
              className="btn-sample" 
              style={{
                background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="mr-1">🔒</span> Staking
            </Link>
          </div>
          
          {/* Custom Demo ID Form */}
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="flex justify-center">
              <input 
                type="text" 
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Enter wallet address or custom ID"
                className="px-3 py-2 border border-gray-300 rounded-l focus:outline-none"
                style={{
                  width: '300px',
                  maxWidth: '100%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: 'var(--text-primary)'
                }}
              />
              <button 
                type="submit"
                className="px-4 py-2 rounded-r"
                style={{
                  background: 'linear-gradient(90deg, #6D28D9 0%, #4F46E5 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Load Demo
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="card card-dark glow-border mb-4" style={{maxWidth: '800px', margin: '0 auto', overflow: 'hidden'}}>
        <Player
          component={VideoPreview}
          durationInFrames={20 * 30} // 20 seconds at 30fps
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          controls
          inputProps={{ videoData }}
          style={{ 
            width: '100%', 
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden' 
          }}
        />
      </div>
      
      <div className="video-text-content card-glass" style={{maxWidth: '800px', margin: '0 auto'}}>
        <h3 className="mb-3 flex items-center glow-text">
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          Generated Analytics Script
        </h3>
        <pre className="p-3 glass" style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-family)',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-md)'
        }}>
          {videoData.generatedText}
        </pre>
      </div>
    </div>
  );
}; 