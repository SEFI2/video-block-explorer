import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface ContractSceneProps {
  contracts: Array<{
    address: string;
    name: string;
    interactionCount: number;
  }>;
}

export const ContractScene: React.FC<ContractSceneProps> = ({ contracts }) => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill 
      style={{ 
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
      }}
    >
      <h1 
        style={{ 
          fontSize: 60, 
          marginBottom: 40,
          color: '#3b82f6',
          textShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          opacity: interpolate(frame, [0, 30], [0, 1]),
          transform: `translateY(${interpolate(frame, [0, 30], [20, 0])}px)`,
        }}
      >
        Contract Interactions
      </h1>
      
      <div style={{
        width: '80%',
        maxWidth: 900,
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: 20,
        padding: 30,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        transform: `scale(${interpolate(frame, [0, 30], [0.9, 1])})`,
        opacity: interpolate(frame, [0, 30], [0, 1]),
      }}>
        {contracts && contracts.length > 0 ? contracts.slice(0, 5).map((contract, i) => {
          // Stagger the animation for each contract
          const delay = i * 10;
          const elementOpacity = interpolate(
            frame, 
            [30 + delay, 45 + delay], 
            [0, 1], 
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          const elementTranslateY = interpolate(
            frame, 
            [30 + delay, 45 + delay], 
            [20, 0], 
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          // Calculate width based on interaction count relative to max in dataset
          const maxInteractions = Math.max(...contracts.map(c => c.interactionCount));
          const barWidth = (contract.interactionCount / maxInteractions) * 100;
          const animatedBarWidth = interpolate(
            frame, 
            [45 + delay, 60 + delay], 
            [0, barWidth], 
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          return (
            <div 
              key={contract.address}
              style={{
                marginBottom: 25,
                opacity: elementOpacity,
                transform: `translateY(${elementTranslateY}px)`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#e2e8f0' }}>
                  {contract.name}
                </div>
                <div style={{ fontSize: 18, color: '#94a3b8' }}>
                  {contract.interactionCount} interactions
                </div>
              </div>
              <div style={{ 
                height: 12, 
                width: '100%', 
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                borderRadius: 6,
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${animatedBarWidth}%`, 
                  backgroundColor: '#3b82f6',
                  borderRadius: 6,
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                }} />
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#94a3b8', 
                marginTop: 4, 
                fontFamily: 'monospace'
              }}>
                {contract.address.substring(0, 6)}...{contract.address.substring(contract.address.length - 4)}
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>
            No contracts to display
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}; 