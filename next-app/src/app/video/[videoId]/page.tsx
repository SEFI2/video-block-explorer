'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@remotion/player';
import { VideoPreview } from '@/remotion/MyVideo';
import { TransactionReport } from '@/types/report';



interface VideoDetails {
  balance: string;
  transaction_count: number;
  network_name: string;
  chain_id: number;
  intro_text: string;
  outro_text: string;
  transaction_reports: TransactionReport[];
  report_address: string;
  status: string;
  duration: string;
}

export function VideoStatusPage({ videoId }: { videoId: string }) {
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!videoId) return;
    
    async function fetchVideoDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/${videoId}`);
      
        const data = await response.json();
        console.log('video details', data);
        setVideoDetails(data.video);
      } catch (err) {
        console.error('Error fetching video details:', err);
        setError('Failed to load video details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVideoDetails();
  }, [videoId]);

  function getStatusColor(status: string) {
    switch (status) {
      case 'processing':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  const handleRenderVideo = async () => {
    try {
      setRenderLoading(true);
      setRenderUrl(null);
      setRenderError(null);
      
      const response = await fetch(`/api/remotion/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });
      
      const data = await response.json();
      console.log('render data', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to render video');
      }
      
      setRenderUrl(data.url);
    } catch (err) {
      console.error('Error rendering video:', err);
      setRenderError(err instanceof Error ? err.message : 'Failed to render video');
    } finally {
      setRenderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl animate-pulse backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
            <div className="h-8 bg-gray-700 rounded w-2/3 mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-8"></div>
            <div className="h-64 bg-gray-700 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!videoDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">Video Not Found</h1>
            <p className="text-gray-300">The requested video could not be found.</p>
            <button 
              onClick={() => router.push('/my-videos')} 
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              View My Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare default input props for the Remotion player
  const inputProps = {
    props: {
      userAddress: videoDetails.report_address,
      chainId: videoDetails.chain_id || 1,
      networkName: videoDetails.network_name || "Ethereum",
      balance: videoDetails.balance || "0",
      transactionCount: videoDetails.transaction_count || 0,
      introText: videoDetails.intro_text || "",
      outroText: videoDetails.outro_text || "",
      reports: videoDetails.transaction_reports
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="w-full max-w-5xl animate-slide-up backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {videoDetails.network_name} Activity Report
            </h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(videoDetails.status)}`}>
              {videoDetails.status.toUpperCase()}
            </span>
          </div>
          
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden shadow-xl mb-8">
            <Player
              component={VideoPreview}
              inputProps={inputProps}
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

          {/* Render URL or Error Display */}
          {renderUrl && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-medium">Render completed successfully!</p>
              <a 
                href={renderUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {renderUrl}
              </a>
            </div>
          )}
          
          {renderError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-medium">Render failed</p>
              <p>{renderError}</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button 
              onClick={() => router.push('/my-videos')}
              className="px-4 py-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 transition-colors"
            >
              Back to My Videos
            </button>
            
            <button 
              onClick={handleRenderVideo}
              disabled={renderLoading}
              className={`px-4 py-2 ${renderLoading ? 'bg-blue-400' : 'bg-blue-600'} text-white rounded hover:bg-blue-700 transition-colors flex items-center`}
            >
              {renderLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Rendering...
                </>
              ) : 'Render Video'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

export default function VideoPage() {
  const { videoId } = useParams();
  
  return <VideoStatusPage videoId={videoId as string} />;
} 