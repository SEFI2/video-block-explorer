'use client';

import React from 'react';
import { MockVideoPlayer } from '../../../components/VideoPreview/MockVideoPlayer';

type DemoPageProps = {
  params: {
    demoId: string;
  };
};

export default function DemoPage({ params }: DemoPageProps) {
  return <MockVideoPlayer demoId={params.demoId} />;
} 