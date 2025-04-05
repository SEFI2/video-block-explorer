import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface TextOverlayProps {
  text: string;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({ text }) => {
  const frame = useCurrentFrame();
  
  // If text is empty or undefined, return null
  if (!text) return null;
  
  // Parse the text to extract meaningful sentences for the overlay
  const sentences = text
    .split(/\n|\./)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 120) // Filter for reasonable length sentences
    .filter(s => !s.includes('[') && !s.includes(']')) // Filter out scene markers
    .slice(0, 5); // Take only the first 5 sentences
  
  if (sentences.length === 0) return null;
  
  // Get current sentence based on frame
  const durationPerSentence = 90; // 3 seconds per sentence at 30fps
  const currentSentenceIndex = Math.floor(frame / durationPerSentence) % sentences.length;
  const currentSentence = sentences[currentSentenceIndex];
  
  // Calculate opacity for smooth transitions
  const sentenceProgress = (frame % durationPerSentence) / durationPerSentence;
  
  // Fade in and out
  let opacity = 1;
  if (sentenceProgress < 0.2) {
    // Fade in during first 20% of time
    opacity = interpolate(sentenceProgress, [0, 0.2], [0, 1], {
      extrapolateRight: 'clamp',
    });
  } else if (sentenceProgress > 0.8) {
    // Fade out during last 20% of time
    opacity = interpolate(sentenceProgress, [0.8, 1], [1, 0], {
      extrapolateLeft: 'clamp',
    });
  }
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          padding: '16px 30px',
          borderRadius: 10,
          maxWidth: '80%',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontSize: 22,
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {currentSentence}
        </div>
      </div>
    </AbsoluteFill>
  );
}; 