import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface TransactionSceneProps {
  transactions: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
  }>;
  totalValue: string;
}

export const TransactionScene: React.FC<TransactionSceneProps> = ({ 
  transactions, 
  totalValue 
}) => {
  const frame = useCurrentFrame();
  
  // Animation for the title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: 'clamp',
  });
  
  // Animation for the transaction container
  const containerOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const containerScale = interpolate(frame, [20, 40], [0.9, 1], {
    extrapolateRight: 'clamp',
  });
  
  // Animation for the total value
  const totalValueOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const totalValueY = interpolate(frame, [70, 90], [20, 0], {
    extrapolateRight: 'clamp',
  });
  
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
      {/* Title */}
      <h1
        style={{
          fontSize: 60,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          color: '#3b82f6',
          textShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          marginBottom: 40,
        }}
      >
        Transaction History
      </h1>
      
      {/* Transactions */}
      <div
        style={{
          width: '80%',
          maxWidth: 900,
          opacity: containerOpacity,
          transform: `scale(${containerScale})`,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: '30px 20px',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.3)',
          marginBottom: 40,
        }}
      >
        <div style={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 15,
          marginBottom: 15,
          display: 'grid',
          gridTemplateColumns: '3fr 2fr 2fr 1fr',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#94a3b8',
        }}>
          <div>Transaction</div>
          <div>From</div>
          <div>To</div>
          <div style={{ textAlign: 'right' }}>Value</div>
        </div>
        
        {transactions && transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => {
          // Stagger animation for each transaction
          const delay = i * 10;
          const txOpacity = interpolate(
            frame, 
            [40 + delay, 55 + delay], 
            [0, 1], 
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          const txY = interpolate(
            frame, 
            [40 + delay, 55 + delay], 
            [20, 0], 
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          const formatAddress = (address: string) => 
            `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
          
          const date = new Date(tx.timestamp);
          const timeAgo = ((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) < 1 
            ? `${Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))} hours ago` 
            : `${Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))} days ago`;
          
          return (
            <div 
              key={tx.hash} 
              style={{
                marginBottom: 15,
                padding: '12px 10px',
                borderRadius: 10,
                background: 'rgba(30, 41, 59, 0.5)',
                display: 'grid',
                gridTemplateColumns: '3fr 2fr 2fr 1fr',
                alignItems: 'center',
                fontSize: 16,
                opacity: txOpacity,
                transform: `translateY(${txY}px)`,
              }}
            >
              <div>
                <div style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>
                  {formatAddress(tx.hash)}
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
                  {timeAgo}
                </div>
              </div>
              <div>
                <div style={{ 
                  fontFamily: 'monospace', 
                  color: tx.from.toLowerCase() === 'your_address' ? '#3b82f6' : '#e2e8f0', 
                  fontWeight: tx.from.toLowerCase() === 'your_address' ? 'bold' : 'normal',
                }}>
                  {formatAddress(tx.from)}
                </div>
              </div>
              <div>
                <div style={{ 
                  fontFamily: 'monospace', 
                  color: tx.to.toLowerCase() === 'your_address' ? '#3b82f6' : '#e2e8f0',
                  fontWeight: tx.to.toLowerCase() === 'your_address' ? 'bold' : 'normal',
                }}>
                  {formatAddress(tx.to)}
                </div>
              </div>
              <div style={{ 
                textAlign: 'right', 
                fontWeight: 'bold',
                color: tx.from.toLowerCase() === 'your_address' ? '#ef4444' : '#10b981',
              }}>
                {tx.value} ETH
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>
            No transactions to display
          </div>
        )}
      </div>
      
      {/* Total Value */}
      <div
        style={{
          opacity: totalValueOpacity,
          transform: `translateY(${totalValueY}px)`,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 16,
          padding: '20px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        }}
      >
        <div style={{ fontSize: 24, color: '#94a3b8', marginBottom: 10 }}>
          Total Transaction Volume
        </div>
        <div style={{ 
          fontSize: 48, 
          fontWeight: 'bold',
          color: '#3b82f6',
          textShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
        }}>
          {totalValue}
        </div>
      </div>
    </AbsoluteFill>
  );
}; 