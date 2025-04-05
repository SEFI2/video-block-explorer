'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { getBlockchainProfile } from '../../remotion/blockchainProfiles';
import { VideoPreview } from '@/remotion/MyVideo';

export const MockVideoPlayer = () => {
  // Get blockchain profile data based on demoId
  const profileData = getBlockchainProfile();
  
  // Log the profile data to help with debugging
  useEffect(() => {
    console.log('Profile data:', profileData);
  }, [profileData]);

  return (
    <div className="video-player-container card-gradient animate-slide-up">
      <Player
          component={VideoPreview}
          inputProps={{props: {balance: profileData.tokenBalance, ...profileData}}}
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