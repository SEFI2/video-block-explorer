'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../../contexts/Web3Context';
import { VideoStatus, VideoData } from '../../types';

// Extended VideoData interface to include transaction reports
interface ExtendedVideoData extends VideoData {
  transactionReports?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    reportData?: Record<string, unknown>;
  };
}

export const MyVideos: React.FC = () => {
  const { active, account } = useWeb3();
  const [videos, setVideos] = useState<ExtendedVideoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    console.log({ account });
  // Load videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      if (!active || !account) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching videos for account:', account);
        
        // Fetch videos through API instead of direct Supabase query
        const response = await fetch(`/api/videos/user/${account}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.videos) {
          setVideos(data.videos);
        } else {
          setVideos([]);
        }
      } catch (err: unknown) {
        console.error('Error fetching videos from API:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [active, account]);

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">My Videos</h2>
        <div className="p-6 bg-slate-50 rounded-lg shadow-sm text-center">
          Please connect your wallet to view your videos.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">My Videos</h2>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Create Video
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-pulse text-gray-500">Loading your videos...</div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-lg text-center">
          <p className="mb-4">You don&apos;t have any videos yet.</p>
          <Link href="/" className="text-blue-600 hover:underline">Create your first video</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {videos.map((video) => {
            const videoUrl = video.transactionReports?.videoUrl || video.finalUrl;
            
            return (
              <div key={video.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white max-w-[220px]">
                {videoUrl ? (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative aspect-square">
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded bg-black/70 text-white">
                        {VideoStatus[video.status]}
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="relative aspect-square">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-xs text-slate-500">Processing...</span>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded bg-black/70 text-white">
                      {VideoStatus[video.status]}
                    </div>
                  </div>
                )}
                
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-1">{video.prompt}</h3>
                  <div className="text-[10px] text-gray-500 mb-2">
                    {video.duration}s • {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                  
                  {video.status === VideoStatus.Completed && (
                    <div className="flex gap-1">
                      {video.transactionReports?.videoUrl && (
                        <a 
                          href={video.transactionReports.videoUrl} 
                          download={`video-${video.id}.mp4`}
                          className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-1 text-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Report
                        </a>
                      )}
                      {video.finalUrl && (
                        <a 
                          href={video.finalUrl} 
                          download={`video-${video.id}.mp4`}
                          className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex-1 text-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Original
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function MyVideosPage() {
  return <MyVideos />;
} 