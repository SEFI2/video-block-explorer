import React from 'react';
import { VideoRequest } from '@/types/video';

interface VideoRequestCardProps {
  videoRequest: VideoRequest;
}

export function VideoRequestCard({ videoRequest }: VideoRequestCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{videoRequest.prompt.length > 30 
            ? `${videoRequest.prompt.slice(0, 30)}...` 
            : videoRequest.prompt}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[videoRequest.status]}`}>
            {videoRequest.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 mb-3">
          <p>Duration: {videoRequest.duration}</p>
          <p>Deposit: {videoRequest.deposit} ETH</p>
          <p>User: {truncateAddress(videoRequest.user_address)}</p>
          <p>Created: {formatDate(videoRequest.created_at)}</p>
        </div>
        
        {videoRequest.generated_text && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <p className="font-medium text-xs uppercase text-gray-500 mb-1">Generated Text</p>
            <p className="text-gray-700">{videoRequest.generated_text.length > 100 
              ? `${videoRequest.generated_text.slice(0, 100)}...` 
              : videoRequest.generated_text}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 flex justify-end">
        <a 
          href={`/video/${videoRequest.request_id}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </a>
      </div>
    </div>
  );
} 