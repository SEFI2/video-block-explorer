'use client';

import React, { useEffect } from 'react';
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="w-full max-w-5xl animate-slide-up backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Blockchain Activity Visualization Demo
            </h1>
          </div>
          
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden shadow-xl mb-8">
            <Player
              component={VideoPreview}
              inputProps={{props: {...profileData, introText: profileData.generatedText, outroText: profileData.generatedText}}}
              durationInFrames={20 * 30}
              fps={30}
              compositionWidth={1280}
              compositionHeight={720}
              controls
              style={{ 
                width: '100%',
                borderRadius: '0.75rem'
              }}
              acknowledgeRemotionLicense={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default function MockVideoPage() {
  return <MockVideoPlayer />;
} 