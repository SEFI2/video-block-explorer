import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

interface IntroSceneProps {
  userAddress: string;
  introText: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ userAddress, introText }) => {
  const frame = useCurrentFrame();
  
  // Animation values with smoother transitions
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const mainScale = spring({
    frame,
    from: 0.85,
    to: 1,
    fps: 30,
    durationInFrames: 30,
  });
  
  const titleY = interpolate(frame, [0, 30, 60, 90], [40, 0, 0, -20], {
    extrapolateRight: 'clamp',
  });
  
  const addressOpacity = interpolate(frame, [40, 65], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const addressY = spring({
    frame: Math.max(0, frame - 40),
    from: 20,
    to: 0,
    fps: 30,
    durationInFrames: 25,
  });
  
  const textOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const textY = spring({
    frame: Math.max(0, frame - 80),
    from: 20,
    to: 0,
    fps: 30,
    durationInFrames: 25,
  });
  
  // Format wallet address
  const shortAddress = userAddress.length > 10 
    ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`
    : userAddress;
  
  // Background animation
  const bgGradientRotate = interpolate(frame, [0, 180], [0, 10], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${bgGradientRotate}deg, #0f172a 0%, #1e293b 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        zIndex: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.8) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.8) 0%, transparent 50%)`,
      }} />
      
      {/* Floating dots */}
      {[...Array(20)].map((_, i) => {
        const size = Math.random() * 8 + 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const animationOffset = Math.random() * 200;
        const yMovement = interpolate(
          (frame + animationOffset) % 200, 
          [0, 100, 200], 
          [0, size * 2, 0],
          { extrapolateRight: 'clamp' }
        );
        
        return (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              left: `${left}%`,
              top: `${top}%`,
              transform: `translateY(${yMovement}px)`,
              zIndex: 1,
            }}
          />
        );
      })}

      {/* Title Section */}
      <div
        style={{
          opacity,
          transform: `translateY(${titleY}px) scale(${mainScale})`,
          marginBottom: 50,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: '800',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 5px 30px rgba(99, 102, 241, 0.4)',
            letterSpacing: '-1px',
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
          marginBottom: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: '600',
            color: '#cbd5e1',
            marginBottom: 15,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          Wallet Analysis
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: '700',
            padding: '14px 28px',
            borderRadius: 16,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#818cf8',
            boxShadow: '0 0 10px #818cf8',
          }} />
          {shortAddress}
        </div>
      </div>
      
      {/* Intro Text */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          maxWidth: 800,
          textAlign: 'center',
          fontSize: 26,
          lineHeight: 1.6,
          color: '#f1f5f9',
          padding: '0 20px',
          fontWeight: '400',
          zIndex: 2,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        {introText}
      </div>
    </AbsoluteFill>
  );
}; 