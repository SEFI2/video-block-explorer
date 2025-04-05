import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface OutroSceneProps {
  userAddress: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ userAddress }) => {
  const frame = useCurrentFrame();
  
  // Animation values
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: 'clamp',
  });
  
  const logoOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const logoScale = interpolate(frame, [60, 90], [0.5, 1], {
    extrapolateRight: 'clamp',
  });
  
  // Format wallet address
  const shortAddress = userAddress.length > 10 
    ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`
    : userAddress;
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 900,
          padding: 30,
        }}
      >
        <h1
          style={{
            fontSize: 60,
            color: '#3b82f6',
            textShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            marginBottom: 30,
          }}
        >
          Activity Summary
        </h1>
        
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.6,
            color: '#e2e8f0',
            marginBottom: 40,
            maxWidth: 800,
          }}
        >
          This analysis provides insights into your on-chain activity for wallet{' '}
          <span
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              padding: '4px 10px',
              borderRadius: 6,
              fontFamily: 'monospace',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            {shortAddress}
          </span>
        </div>
        
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: '#94a3b8',
            marginBottom: 50,
            padding: '20px 30px',
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: 16,
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
            textAlign: 'left',
          }}
        >
          <p>Key insights from your blockchain activity:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}>
              Regular interaction with major DeFi protocols
            </li>
            <li style={{ marginBottom: 10 }}>
              Diverse portfolio of tokens and NFT assets
            </li>
            <li style={{ marginBottom: 10 }}>
              Consistent transaction patterns showing active participation
            </li>
            <li style={{ marginBottom: 10 }}>
              Smart contract usage demonstrates blockchain sophistication
            </li>
          </ul>
        </div>
      </div>
      
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          position: 'absolute',
          bottom: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
            marginBottom: 10,
          }}
        >
          Blockchain Analytics
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#94a3b8',
          }}
        >
          Powered by Blockchain Technology
        </div>
      </div>
    </AbsoluteFill>
  );
}; 