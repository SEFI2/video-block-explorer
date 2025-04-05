'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { VideoStatusPage } from '../../../components/VideoStatusPage';

export default function VideoPage() {
  const { videoId } = useParams();
  
  return <VideoStatusPage videoId={videoId as string} />;
} 