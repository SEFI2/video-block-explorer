'use client';

import React, { useEffect } from 'react';
import { Player } from '@remotion/player';
import { getBlockchainProfile } from '../../remotion/blockchainProfiles';
import { VideoPreview } from '@/remotion/MyVideo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCode } from '@fortawesome/free-solid-svg-icons';

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
              Blockchain Activity Visualization
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Your personalized on-chain activity visualization
            </p>
          </div>
          
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden shadow-xl mb-8">
            <Player
              component={VideoPreview}
              inputProps={{props: {...profileData}}}
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
          
          {/* Generated Script */}
          <div className="bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 transition-all hover:shadow-md hover:shadow-primary/10 mt-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mr-3">
                <FontAwesomeIcon icon={faFileCode} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white">Generated Script</h3>
            </div>
            
            <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700/50">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {profileData.generatedText}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default function MockVideoPage() {
  return <MockVideoPlayer />;
} 