import React from 'react';
import { Composition } from 'remotion';
import { getBlockchainProfile } from './blockchainProfiles';
import { VideoPreview } from './MyVideo';
import { z } from 'zod';
import { CalculateMetadataFunction } from 'remotion';
import { VIDEO_HEIGHT } from './config';
import { VIDEO_WIDTH } from './config';
import { VIDEO_FPS } from './config';
import { COMPOSITION_ID } from './config';
import { DURATION_IN_FRAMES } from './config';


export const CompositionProps = z.object({
  props: z.object({
    userAddress: z.string(),
    chainId: z.number(),
    networkName: z.string(),
    balance: z.string(),
    transactionCount: z.number(),
    introText: z.string(),
    outroText: z.string(),
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
    })
});

const FPS = 30;

// Create default props matching the schema
const defaultProps = getBlockchainProfile();

const calculateMetadata: CalculateMetadataFunction<
  z.infer<typeof CompositionProps>
> = ({ props }) => {
  return {
    durationInFrames: 
        FPS * (/* Intro */3 + /* Reports */5 * props.props.reports.length + /* Outro */5),
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    props: props,
  };
};



export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMPOSITION_ID}
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