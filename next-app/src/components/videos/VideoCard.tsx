'use client';

import React from 'react';
import Link from 'next/link';
import { VideoData, VideoStatus } from '@/types/video';
import Image from 'next/image';
interface VideoCardProps {
  video: VideoData;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
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
  const getStatusColorClass = (status: VideoStatus): string => {
    const colorMap: { [key: number]: string } = {
      [VideoStatus.Requested]: 'bg-blue-100 text-blue-800',
      [VideoStatus.Processing]: 'bg-orange-100 text-orange-800',
      [VideoStatus.PreviewReady]: 'bg-purple-100 text-purple-800',
      [VideoStatus.Rendering]: 'bg-teal-100 text-teal-800',
      [VideoStatus.Completed]: 'bg-green-100 text-green-800',
      [VideoStatus.Failed]: 'bg-red-100 text-red-800',
      [VideoStatus.Refunded]: 'bg-gray-100 text-gray-800'
    };
    
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Truncate text if too long
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border border-gray-700">
      <div className="p-4">
        <div className="flex justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">Video #{video.id}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(video.status)}`}>
            {getStatusText(video.status)}
          </span>
        </div>

        {/* Thumbnail placeholder or actual image */}
        <div className="w-full h-44 bg-gray-900 rounded-md mb-3 flex items-center justify-center overflow-hidden">
          {video.status >= VideoStatus.PreviewReady && video.previewUrl ? (
            <Image 
              src={video.previewUrl.replace('.mp4', '.jpg')} 
              alt={`Preview of video ${video.id}`}
              className="w-full h-full object-cover" 
              width={300}
              height={300}
            />
          ) : (
            <div className="text-gray-500 text-center p-4">
              {video.status === VideoStatus.Processing ? 'Processing...' : 'Pending'}
            </div>
          )}
        </div>

        <div className="space-y-2 text-gray-300">
          <p className="line-clamp-2">{truncateText(video.prompt, 100)}</p>
          <p className="text-sm text-gray-400">Duration: {video.duration}</p>
          <p className="text-sm text-gray-400">Created: {formatDate(video.createdAt)}</p>
        </div>
      </div>

      <div className="bg-gray-900 p-3">
        <Link
          href={`/video/${video.id}`}
          className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VideoCard; 