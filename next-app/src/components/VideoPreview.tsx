import React from 'react';

interface VideoPreviewProps {
  videoUrl: string;
  title: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  posterUrl?: string;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoUrl,
  title,
  autoPlay = false,
  muted = true,
  controls = true,
  posterUrl,
  className = '',
}) => {
  if (!videoUrl) {
    return (
      <div className={`placeholder-image ${className}`}>
        <span>No video available</span>
      </div>
    );
  }

  return (
    <div className={`video-container ${className}`}>
      <video
        src={videoUrl}
        poster={posterUrl}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        className="video-player"
        title={title}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPreview; 