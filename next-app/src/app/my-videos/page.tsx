'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../../contexts/Web3Context';
import { VideoStatus, VideoData } from '../../types';
import Image from 'next/image';
import { getSupabase } from '../../lib/db/supabase';
import VideoPreview from '../../components/VideoPreview';

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

  // Load videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      if (!active || !account) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get Supabase client
        const supabase = getSupabase();
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }
        
        // Query video_requests table for the user's wallet address including transaction_reports
        const { data, error } = await supabase
          .from('video_requests')
          .select(`
            *,
            transaction_reports (*)
          `)
          .eq('user_address', account)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convert database records to ExtendedVideoData format
          const videoData: ExtendedVideoData[] = data.map(record => ({
            id: record.request_id,
            status: record.status as unknown as VideoStatus,
            prompt: record.prompt,
            duration: record.duration,
            previewUrl: record.script_data?.previewUrl || '',
            finalUrl: record.script_data?.finalUrl || '',
            createdAt: new Date(record.created_at || record.request_timestamp).getTime(),
            updatedAt: new Date(record.updated_at || record.request_timestamp).getTime(),
            transactionReports: record.transaction_reports ? {
              videoUrl: record.transaction_reports.video_url,
              thumbnailUrl: record.transaction_reports.thumbnail_url,
              reportData: record.transaction_reports.report_data
            } : undefined
          }));
          
          setVideos(videoData);
        }
      } catch (err: unknown) {
        console.error('Error fetching videos from database:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [active, account]);

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
        <div className="notification">
          You don&apos;t have any videos yet. <Link href="/">Create your first video!</Link>
        </div>
      ) : (
        <>
          <Link href="/" className="create-button">Create Another Video</Link>
          
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-preview">
                  {video.transactionReports?.videoUrl ? (
                    <VideoPreview 
                      videoUrl={video.transactionReports.videoUrl}
                      title={video.prompt}
                      posterUrl={video.transactionReports.thumbnailUrl} 
                      className="video-player-container"
                    />
                  ) : (video.previewUrl || video.finalUrl) ? (
                    <Image 
                      src={video.finalUrl || video.previewUrl}
                      alt={video.prompt}
                      width={320}
                      height={180}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <span>Processing...</span>
                    </div>
                  )}
                  <div className={`status-badge status-${VideoStatus[video.status].toLowerCase()}`}>
                    {VideoStatus[video.status]}
                  </div>
                </div>
                
                <div className="video-info">
                  <h3>{video.prompt.substring(0, 60)}{video.prompt.length > 60 ? '...' : ''}</h3>
                  <div className="video-meta">
                    <span>Duration: {video.duration}s</span>
                    <span>Created: {new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {video.status === VideoStatus.Completed && (
                    <div className="video-buttons">
                      {video.transactionReports?.videoUrl && (
                        <a 
                          href={video.transactionReports.videoUrl} 
                          download={`video-${video.id}.mp4`}
                          className="download-button"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download Report Video
                        </a>
                      )}
                      {video.finalUrl && (
                        <a 
                          href={video.finalUrl} 
                          download={`video-${video.id}.mp4`}
                          className="download-button mt-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download Original Video
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function MyVideosPage() {
  return <MyVideos />;
} 