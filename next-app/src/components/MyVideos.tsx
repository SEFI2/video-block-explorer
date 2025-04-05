'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../contexts/Web3Context';
import { VideoStatus, VideoData } from '../types';
import Image from 'next/image';

interface VideoDetailsResult {
  id: string;
  status: VideoStatus;
  prompt: string;
  duration: string;
  previewUrl: string;
  finalUrl: string;
  createdAt: number;
  updatedAt: number;
}

export const MyVideos: React.FC = () => {
  const { videoRequests, active, account, contracts } = useWeb3();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load videos from contract
  useEffect(() => {
    const fetchVideos = async () => {
      if (!active || !account || !contracts.videoGenerator) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get all video details
        const videoDetails = await Promise.all(
          videoRequests.map(async (requestId: string) => {
            try {
              if (!contracts.videoGenerator) return null;
              
              const details = await contracts.videoGenerator.getRequestDetails(requestId);
              
              return {
                id: requestId,
                status: details.status,
                prompt: details.dataPrompt,
                duration: details.dataDuration,
                previewUrl: details.previewUrl || '',
                finalUrl: details.finalUrl || '',
                createdAt: details.createdAt.toNumber(),
                updatedAt: details.updatedAt.toNumber()
              } as VideoDetailsResult;
            } catch (err) {
              console.error(`Error fetching details for video ${requestId}:`, err);
              return null;
            }
          })
        );
        
        // Filter out any null results from failed requests
        const validVideos = videoDetails.filter((video): video is VideoDetailsResult => video !== null);
        
        // Sort by created date, newest first
        validVideos.sort((a, b) => b.createdAt - a.createdAt);
        
        // Convert to VideoData[] type
        setVideos(validVideos as VideoData[]);
      } catch (err: unknown) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : 'Error fetching videos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [active, account, contracts.videoGenerator, videoRequests]);

  // Format date for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status text
  const getStatusText = (status: VideoStatus): string => {
    const statusMap: { [key: number]: string } = {
      [VideoStatus.Requested]: 'Requested',
      [VideoStatus.Processing]: 'Processing',
      [VideoStatus.PreviewReady]: 'Preview Ready',
      [VideoStatus.Rendering]: 'Rendering',
      [VideoStatus.Completed]: 'Completed',
      [VideoStatus.Failed]: 'Failed',
      [VideoStatus.Refunded]: 'Refunded'
    };
    
    return statusMap[status] || 'Unknown';
  };

  // Get status color
  const getStatusColor = (status: VideoStatus): string => {
    const colorMap: { [key: number]: string } = {
      [VideoStatus.Requested]: 'blue',
      [VideoStatus.Processing]: 'orange',
      [VideoStatus.PreviewReady]: 'purple',
      [VideoStatus.Rendering]: 'teal',
      [VideoStatus.Completed]: 'green',
      [VideoStatus.Failed]: 'red',
      [VideoStatus.Refunded]: 'gray'
    };
    
    return colorMap[status] || 'gray';
  };

  if (!active) {
    return (
      <div className="my-videos">
        <h2>My Videos</h2>
        <div className="notification">
          Please connect your wallet to view your videos.
        </div>
      </div>
    );
  }

  return (
    <div className="my-videos">
      <h2>My Videos</h2>
      
      {isLoading ? (
        <div className="loading">Loading your videos...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : videos.length === 0 ? (
        <div className="no-videos">
          <p>You don&apos;t have any videos yet.</p>
          <Link href="/" className="create-button">Create Your First Video</Link>
        </div>
      ) : (
        <div className="videos-list">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <Link href={`/video/${video.id}`} className="video-link">
                <div className="video-thumbnail">
                  {video.status >= VideoStatus.PreviewReady && video.previewUrl ? (
                    <Image 
                      src={video.previewUrl.replace('.mp4', '.jpg')} 
                      alt={`Preview of video ${video.id}`} 
                      width={300}
                      height={300}
                    />
                  ) : (
                    <div className="placeholder-thumbnail">
                      <span className="placeholder-text">
                        {video.status === VideoStatus.Processing ? 'Processing...' : 'Pending'}
                      </span>
                    </div>
                  )}
                  
                  <div className={`status-badge ${getStatusColor(video.status)}`}>
                    {getStatusText(video.status)}
                  </div>
                </div>
                
                <div className="video-info">
                  <h3 className="video-title">Video #{video.id}</h3>
                  <p className="video-prompt">{video.prompt}</p>
                  <p className="video-date">Created: {formatDate(video.createdAt)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      
      {videos.length > 0 && (
        <Link href="/" className="create-button">Create Another Video</Link>
      )}
    </div>
  );
};

export default MyVideos; 