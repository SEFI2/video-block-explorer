import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface IntroSceneProps {
  userAddress: string;
  introText: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ userAddress, introText }) => {
  const frame = useCurrentFrame();
  
  // Animation values
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: 'clamp',
  });
  
  const logoY = interpolate(frame, [0, 30, 60, 90], [50, 0, 0, -50], {
    extrapolateRight: 'clamp',
  });
  
  const addressOpacity = interpolate(frame, [45, 75], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const addressY = interpolate(frame, [45, 75], [20, 0], {
    extrapolateRight: 'clamp',
  });
  
  const textOpacity = interpolate(frame, [90, 120], [0, 1], {
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
      {/* Logo */}
      <div
        style={{
          opacity,
          transform: `translateY(${logoY}px) scale(${scale})`,
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        >
          Blockchain Analytics
        </div>
      </div>
      
      {/* Wallet Address */}
      <div
        style={{
          opacity: addressOpacity,
          transform: `translateY(${addressY}px)`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#94a3b8',
            marginBottom: 10,
          }}
        >
          Wallet Analysis
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: 12,
            background: 'rgba(30, 41, 59, 0.7)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
            fontFamily: 'monospace',
            color: '#3b82f6',
            border: '2px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          {shortAddress}
        </div>
      </div>
      
      {/* Intro Text */}
      <div
        style={{
          opacity: textOpacity,
          maxWidth: 800,
          textAlign: 'center',
          fontSize: 24,
          lineHeight: 1.5,
          color: '#e2e8f0',
          padding: '0 20px',
        }}
      >
        A comprehensive analysis of your on-chain activity, transactions, and smart contract interactions.
      </div>
    </AbsoluteFill>
  );
}; 