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
      try {
        setIsLoading(true);
        console.log('Fetching all videos');
        
        // Fetch videos through API instead of direct Supabase query
        const response = await fetch(`/api/videos`);
        
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
  }, []); // Remove dependency on active and account

  const getStatusBadgeColor = (status: VideoStatus) => {
    switch (status) {
      case VideoStatus.Completed:
        return 'bg-green-100 text-green-800';
      case VideoStatus.Processing:
        return 'bg-blue-100 text-blue-800';
      case VideoStatus.Failed:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">All Videos</h2>
          <p className="text-gray-500 mt-1">View all generated videos</p>
        </div>
        <Link 
          href="/" 
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Video
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-60">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-500">Loading videos...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Error loading videos</span>
          </div>
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="p-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-sm text-center">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">No videos yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">No videos have been created yet. Get started by creating your first AI-generated video.</p>
          <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => {            
            return (
              <div key={video.request_id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 flex flex-col">
                <Link href={`/video/${video.request_id}`} className="block relative">
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">                    
                    <div className={`absolute top-2 right-2 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(video.status)}`}>
                      {VideoStatus[video.status]}
                    </div>
                    
                    {video.status === VideoStatus.Processing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4 flex-grow flex flex-col">
                  <Link href={`/video/${video.request_id}`} className="block">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                      {video.prompt || 'Untitled Video'}
                    </h3>
                  </Link>
                  
                  <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {video.duration}s
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-2">
                    {video.status === VideoStatus.Completed ? (
                      <div className="flex gap-2">
                        <Link 
                          href={`/video/${video.request_id}`}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1 text-center font-medium"
                        >
                          View Details
                        </Link>
                        
                        {video.transactionReports?.videoUrl && (
                          <a 
                            href={video.transactionReports.videoUrl} 
                            download={`video-${video.request_id}.mp4`}
                            className="text-xs px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ) : (
                      <Link 
                        href={`/video/${video.request_id}`}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center block font-medium"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
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