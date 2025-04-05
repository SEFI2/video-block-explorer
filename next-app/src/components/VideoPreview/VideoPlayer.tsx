import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VideoPreview } from './index';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

interface Contract {
  address: string;
  name: string;
  interactionCount: number;
}

interface VideoDataType {
  userAddress: string;
  transactions: Transaction[];
  contracts: Contract[];
  totalValue: string;
  generatedText: string;
}

export const VideoPlayer: React.FC = () => {
  const { requestId } = useParams<{requestId: string}>();
  const [videoData, setVideoData] = useState<VideoDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // Fetch video request data from your backend
        const { data } = await axios.get(`http://localhost:5001/api/video/${requestId}`);
        
        if (data && data.video) {
          // Parse the generated text from the request
          const generatedText = data.video.generated_text;
          
          // For a complete implementation, you'd also fetch blockchain data 
          // for this request if not already included in the response
          
          // Create the formatted video data
          setVideoData({
            userAddress: data.video.user_address,
            transactions: mockTransactions(data.video.user_address),
            contracts: mockContracts(),
            totalValue: "0.1 ETH", // Would come from real data
            generatedText
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('Failed to load video data');
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [requestId]);
  
  // Mock data generation functions (replace with real data in production)
  const mockTransactions = (address: string): Transaction[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      hash: `0x${i}${'0'.repeat(63)}`,
      from: i % 2 === 0 ? address : `0x${'a'.repeat(40)}`,
      to: i % 2 === 0 ? `0x${'b'.repeat(40)}` : address,
      value: (i * 0.01).toString(),
      timestamp: Date.now() - i * 86400000
    }));
  };
  
  const mockContracts = (): Contract[] => {
    return [{
      address: `0x${'c'.repeat(40)}`,
      name: 'Mock Contract',
      interactionCount: 3
    }];
  };
  
  if (loading) return <div>Loading video data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!videoData) return <div>No video data found</div>;
  
  return (
    <div className="video-player-container">
      <h2>Video Preview</h2>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <Player
          component={VideoPreview}
          durationInFrames={20 * 30} // 20 seconds at 30fps
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          controls
          inputProps={{ videoData }}
        />
      </div>
      
      <div className="video-text-content" style={{ margin: '20px 0' }}>
        <h3>Generated Script</h3>
        <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
          {videoData.generatedText}
        </pre>
      </div>
    </div>
  );
}; 