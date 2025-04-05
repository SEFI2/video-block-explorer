'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../../contexts/Web3Context';
import { VideoStatus, VideoData } from '../../types';
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
      {videos.length > 0 && (
        <Link href="/" className="create-button">Create Another Video</Link>
      )}
    </div>
  );
};

export default function MyVideosPage() {
  return <MyVideos />;
} 