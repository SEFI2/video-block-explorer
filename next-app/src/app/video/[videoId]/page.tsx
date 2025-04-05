'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  generated_text?: string;
  url?: string;
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
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video details: ${response.status}`);
        }
        
        const data = await response.json();
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{videoDetails.title}</h1>
            <p className="text-sm text-gray-500">Created on {formatDate(videoDetails.created_at)}</p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(videoDetails.status)}`}>
              {videoDetails.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-600">{videoDetails.description}</p>
        </div>
        
        {videoDetails.generated_text && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Content</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-600 whitespace-pre-line">{videoDetails.generated_text}</p>
            </div>
          </div>
        )}
        
        {videoDetails.url && videoDetails.status === 'completed' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Video</h2>
            <div className="aspect-w-16 aspect-h-9">
              <video 
                controls 
                className="w-full h-full rounded"
                src={videoDetails.url}
                poster="/video-placeholder.jpg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => router.push('/my-videos')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to My Videos
          </button>
          
          {videoDetails.status === 'completed' && videoDetails.url && (
            <button 
              onClick={() => window.open(videoDetails.url, '_blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Download Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 

export default function VideoPage() {
  const { videoId } = useParams();
  
  return <VideoStatusPage videoId={videoId as string} />;
} 