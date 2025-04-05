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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!videoDetails) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Video Not Found</h1>
          <p className="text-gray-700">The requested video could not be found.</p>
          <button 
            onClick={() => router.push('/my-videos')} 
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View My Videos
          </button>
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mt-2 md:mt-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(videoDetails.status)}`}>
              {videoDetails.status.toUpperCase()}
            </span>
          </div>
        </div>
      

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
            height: '500px', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginTop: '16px',
            marginBottom: '16px'
          }}
          acknowledgeRemotionLicense={true}
        />
        
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => router.push('/my-videos')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to My Videos
          </button>
        </div>
      </div>
    </div>
  );
} 

export default function VideoPage() {
  const { videoId } = useParams();
  
  return <VideoStatusPage videoId={videoId as string} />;
} 