import React, { useCallback } from 'react';
import { 
  AbsoluteFill, 
  // The following imports are commented out but kept for future use
  // Img,
  // staticFile,
  // Audio
  useVideoConfig,
  Series
} from 'remotion';
import { IntroScene } from './IntroScene';
import { OutroScene } from './OutroScene';
import { TextOverlay } from './TextOverlay';
import { TransactionReport } from '@/types/report';

// Interface for component props
interface VideoTransactionProps {
  userAddress: string;
  chainId: number;
  networkName: string;
  balance: string;
  transactionCount: number;
  introText: string;
  reports: TransactionReport[],
  outroText: string;
}

// Simplified video preview component
export const VideoPreview: React.FC<{props: VideoTransactionProps}> = ({props}) => {
  // Must use useVideoConfig() at the top level of a Remotion component
  const videoConfig = useVideoConfig();
  
  // Check if reports exist to prevent errors
  const reports = props.reports || [];
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {/* Use Remotion's built-in Series instead of TransitionSeries */}
      <Series>
        <Series.Sequence durationInFrames={5 * videoConfig.fps}>
          <IntroScene userAddress={props.userAddress} introText={props.introText} />
        </Series.Sequence>
        
        {reports.length > 0 && reports.map((report, index) => (
          <Series.Sequence 
            key={`report-${index}`} 
            durationInFrames={5 * videoConfig.fps}
          >
            <AbsoluteFill>
              <ReportScene report={report} index={index} />
              {report.text && <TextOverlay text={report.text} />}
            </AbsoluteFill>
          </Series.Sequence>
        ))}
        
        <Series.Sequence durationInFrames={5 * videoConfig.fps}>
          <OutroScene userAddress={props.userAddress} outroText={props.outroText} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// Scene component for reports
const ReportScene: React.FC<{
  report: TransactionReport;
  index: number;
}> = ({ report, index }) => {  
  const videoConfig = useVideoConfig();
  console.log("ReportScene videoConfig:", videoConfig);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', padding: '4rem 2rem' }}>
      <div className="flex flex-col h-full">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Wallet Activity Report</h2>
          <p className="text-xl opacity-80">Analysis for period {index + 1}</p>
        </div>
        
        {/* Highlights */}
        {report.highlights && report.highlights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Key Highlights</h3>
            <ul className="list-disc pl-5 space-y-1">
              {report.highlights.map((highlight, i) => (
                <li key={i} className="text-xl">{highlight}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Statistics */}
        {report.statistics && (
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-900 rounded p-4">
                <p className="text-lg opacity-70">Total Value</p>
                <p className="text-2xl font-bold">{report.statistics.totalValue}</p>
              </div>
              <div className="bg-blue-900 rounded p-4">
                <p className="text-lg opacity-70">Unique Addresses</p>
                <p className="text-2xl font-bold">{report.statistics.uniqueAddresses}</p>
              </div>
              <div className="bg-blue-900 rounded p-4">
                <p className="text-lg opacity-70">Significant Txs</p>
                <p className="text-2xl font-bold">{report.statistics.significantTransactions}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
