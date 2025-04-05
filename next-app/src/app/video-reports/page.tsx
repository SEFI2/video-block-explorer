'use client';

import { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VideoPreview } from '@/remotion/MyVideo';
import { TransactionRangeReport } from '@/types/report';
import TransactionReports from '@/components/TransactionReports';

export default function VideoReportsPage() {
  const [walletAddress, setWalletAddress] = useState<string>('0x123456789abcdef123456789abcdef123456789');
  const [reports, setReports] = useState<TransactionRangeReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to handle form submission
  const handleGenerateReports = async (generatedReports: TransactionRangeReport[]) => {
    setReports(generatedReports);
  };

  // Video configurations
  const fps = 30;
  const durationInSeconds = Math.max(10, reports.length * 5 + 4); // 2s intro + (5s per report) + 2s outro
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blockchain Video Report Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Input form */}
        <div>
          <div className="mb-4">
            <label htmlFor="walletAddress" className="block font-medium mb-2">
              Wallet Address
            </label>
            <input
              id="walletAddress"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Report generation component */}
          <TransactionReports 
            walletAddress={walletAddress} 
            onReportsGenerated={handleGenerateReports}
          />
        </div>
        
        {/* Right column: Video preview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Video Preview</h2>
          
          {reports.length > 0 ? (
            <div className="border rounded overflow-hidden aspect-video">
              <Player
                component={VideoPreview}
                inputProps={{
                  videoData: {
                    userAddress: walletAddress,
                    reports: reports
                  }
                }}
                durationInFrames={durationInSeconds * fps}
                fps={fps}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{
                  width: '100%',
                  height: '100%'
                }}
                controls
              />
            </div>
          ) : (
            <div className="border rounded bg-gray-100 flex items-center justify-center aspect-video">
              <p className="text-gray-500">
                Generate reports to see video preview
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={reports.length === 0}
            >
              Render Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 