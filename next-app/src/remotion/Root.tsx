import React from 'react';
import { Composition } from 'remotion';
import { getBlockchainProfile } from './blockchainProfiles';
import { VideoPreview } from './MyVideo';
import { z } from 'zod';
import { CalculateMetadataFunction } from 'remotion';



export const CompositionProps = z.object({
  props: z.object({
    userAddress: z.string(),
    chainId: z.number(),
    networkName: z.string(),
    tokenBalance: z.string(),
    transactionCount: z.number(),
    reports: z.array(
    z.object({
      transactions: z.array(z.any()),
      text: z.string(),
      highlights: z.array(z.string()),
      statistics: z.object({
        totalValue: z.string(),
        uniqueAddresses: z.number(),
        significantTransactions: z.number()
      })
    })
  ),
  generatedText: z.string().optional()
  })
});

const FPS = 30;

// Create default props matching the schema
const defaultProps = getBlockchainProfile();

const calculateMetadata: CalculateMetadataFunction<
  z.infer<typeof CompositionProps>
> = ({ props }) => {
  return {
    durationInFrames: FPS * 20,
    width: 1280,
    height: 720,
    props: props,
  };
};

export const REGION = "us-east-1";

export const COMP_NAME = "MyVideo";
export const DURATION_IN_FRAMES = 500;
export const VIDEO_WIDTH = 540;
export const VIDEO_HEIGHT = 960;
export const VIDEO_FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DefaultVideo"
        component={VideoPreview}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{props: defaultProps}}
        calculateMetadata={calculateMetadata}
      />
      
    </>
  );
}; 