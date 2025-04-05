'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@remotion/player';
import { VideoPreview } from '@/remotion/MyVideo';
import { TransactionReport } from '@/types/report';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ABIS } from '@/constants/contracts';
import dotenv from 'dotenv';

dotenv.config();

interface VideoDetails {
  user_address: string;
  balance: string;
  transaction_count: number;
  network_name: string;
  chain_id: number;
  intro_text: string;
  outro_text: string;
  transaction_reports: TransactionReport[];
  report_address: string;
  status: string;
  duration: string;
  video_uri: string | null;
  video_owner: string | null;
}

// Get ABI from constants
const VideoReportNFT_ABI = CONTRACT_ABIS.VideoReportNFT;
import {
  FPS,
  DURATION_IN_FRAMES,
  VIDEO_WIDTH,
  VIDEO_HEIGHT
} from '@/remotion/config';
// NFT contract address from environment variables

export function VideoStatusPage({ videoId }: { videoId: string }) {
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const router = useRouter();
  const { account, library, active, connectWallet } = useWeb3();
  const ALFAJORES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ALFAJORES_CONTRACT_ADDRESS || '';
  
  console.log({ ALFAJORES_CONTRACT_ADDRESS });

  useEffect(() => {
    if (!videoId) return;
    
    async function fetchVideoDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/${videoId}`);
      
        const data = await response.json();
        console.log('video details', data);
        setVideoDetails(data.video);
      } catch (err) {
        console.error('Error fetching video details:', err);
        setError('Failed to load video details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVideoDetails();
  }, [videoId]);

  function getStatusColor(status: string) {
    switch (status) {
      case 'processing':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  const handleRenderVideo = async () => {
    try {
      setRenderLoading(true);
      setRenderUrl(null);
      setRenderError(null);
      
      const response = await fetch(`/api/remotion/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, address: videoDetails?.user_address }),
      });
      
      const data = await response.json();
      console.log('render data', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to render video');
      }
      
      setRenderUrl(data.url);
    } catch (err) {
      console.error('Error rendering video:', err);
      setRenderError(err instanceof Error ? err.message : 'Failed to render video');
    } finally {
      setRenderLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!videoDetails?.video_uri) {
      setMintError("Video URI is required for minting");
      return;
    }
    
    try {
      setIsMinting(true);
      setMintError(null);
      setMintSuccess(false);
      
      if (!active || !account) {
        await connectWallet();
        if (!active || !account) {
          throw new Error("Failed to connect wallet");
        }
      }
      
      if (!library) {
        throw new Error("Web3 provider not available");
      }
      
      // Get network information
      const network = await library.getNetwork();
      console.log("Current network:", network);
      
      // Get account balance to check if there are enough funds
      const balance = await library.getBalance(account);
      console.log("Account balance:", ethers.formatEther(balance), "ETH");
      
      // Get signer
      const signer = await library.getSigner();
      
      // The mint price is 0.0001 ETH
      const mintPrice = ethers.parseEther("0.0001");
      
      // Debugging information
      console.log("Contract address:", ALFAJORES_CONTRACT_ADDRESS);
      console.log("Account:", account);
      console.log("Video URI:", videoDetails.video_uri);
      console.log("Mint price:", ethers.formatEther(mintPrice), "ETH");
      
      try {
        // Simple ABI with just the function we need
        const simpleABI = [
          "function mintVideoToken(address to, string memory tokenURI) external payable"
        ];
        
        // Create contract instance with minimal ABI
        const nftContract = new ethers.Contract(
          ALFAJORES_CONTRACT_ADDRESS,
          simpleABI,
          signer
        );
        
        console.log("Contract instance created");
        
        // Call the mint function directly
        console.log("Calling mintVideoToken function...");
        const tx = await nftContract.mintVideoToken(account, videoDetails.video_uri, {
          value: mintPrice,
          gasLimit: 500000
        });
        
        console.log("Transaction sent:", tx.hash);
        
        // Wait for the transaction to be mined
        console.log("Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt.hash);
        
        // Store the transaction hash
        setTxHash(receipt.hash);
        
        // Try to extract the token ID from the event
        try {
          const abi = ["event VideoTokenMinted(address indexed to, uint256 indexed tokenId, string videoURI)"];
          const iface = new ethers.Interface(abi);
          
          // Look for the VideoTokenMinted event in the logs
          for (const log of receipt.logs) {
            try {
              const parsedLog = iface.parseLog({
                topics: log.topics,
                data: log.data
              });
              
              if (parsedLog && parsedLog.name === 'VideoTokenMinted') {
                // Extract the token ID
                setTokenId(parsedLog.args.tokenId.toString());
                console.log("Token ID:", parsedLog.args.tokenId.toString());
                break;
              }
            } catch (e) {
              // Not the event we're looking for, continue
              continue;
            }
          }
        } catch (e) {
          console.error("Error parsing event logs:", e);
        }
        
        // Update UI to show success
        setMintSuccess(true);
        
        // Refresh video details to reflect the new ownership
        try {
          const response = await fetch(`/api/videos/${videoId}`);
          const data = await response.json();
          setVideoDetails(data.video);
        } catch (err) {
          console.error('Error refreshing video details:', err);
        }
      } catch (err) {
        console.error("Error in contract interaction:", err);
        throw err;
      }
      
    } catch (err) {
      console.error('Error minting NFT:', err);
      let errorMessage = 'Failed to mint NFT';
      
      if (err instanceof Error) {
        // Extract more details from the error
        errorMessage = err.message;
        
        // Look for specific error conditions
        if (typeof err.message === 'string') {
          if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds to pay for gas and mint price';
          } else if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction was rejected by the user';
          } else if (err.message.includes('execution reverted')) {
            errorMessage = 'Contract execution reverted. This could mean the video has already been minted or the contract is paused.';
          } else if (err.message.toLowerCase().includes('network')) {
            errorMessage = 'Network error. Make sure you are connected to the Celo Alfajores testnet.';
          }
        }
      }
      
      setMintError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl animate-pulse backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
            <div className="h-8 bg-gray-700 rounded w-2/3 mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-8"></div>
            <div className="h-64 bg-gray-700 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!videoDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">Video Not Found</h1>
            <p className="text-gray-300">The requested video could not be found.</p>
            <button 
              onClick={() => router.push('/my-videos')} 
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              View My Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare default input props for the Remotion player
  const inputProps = {
    props: {
      userAddress: videoDetails.report_address,
      chainId: videoDetails.chain_id || 1,
      networkName: videoDetails.network_name || "Ethereum",
      balance: videoDetails.balance || "0",
      transactionCount: videoDetails.transaction_count || 0,
      introText: videoDetails.intro_text || "",
      outroText: videoDetails.outro_text || "",
      reports: videoDetails.transaction_reports
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-80px)] px-4 py-4 pt-2">
      <div className="w-full max-w-5xl animate-slide-up backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5 mt-0">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-4 md:p-6">
          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {videoDetails.network_name} Activity Report
            </h1>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(videoDetails.status)}`}>
              {videoDetails.status.toUpperCase()}
            </span>
          </div>
          
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden shadow-xl mb-12">
            <Player
              component={VideoPreview}
              inputProps={inputProps}
              durationInFrames={3 * FPS + 5 * videoDetails.transaction_reports.length * FPS + 5 * FPS}
              fps={FPS}
              compositionWidth={VIDEO_WIDTH}
              compositionHeight={VIDEO_HEIGHT}
              controls
              style={{ 
                width: '100%',
                height: 'auto',
                aspectRatio: `${VIDEO_WIDTH}/${VIDEO_HEIGHT}`,
                maxWidth: '100%',
                borderRadius: '0.75rem'
              }}
              acknowledgeRemotionLicense={true}
            />
          </div>

          {/* Render URL or Error Display */}
          {renderUrl && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              <p className="font-medium">Render completed successfully!</p>
              <a 
                href={renderUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {renderUrl}
              </a>
            </div>
          )}
          
          {renderError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              <p className="font-medium">Render failed</p>
              <p>{renderError}</p>
            </div>
          )}

          {/* Video Ownership Information */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-sm">
            <h3 className="text-lg font-semibold mb-2 text-primary">Video Status</h3>
            
            {/* Display owner and URI if they exist */}
            {videoDetails.video_owner && (
              <div className="mb-2">
                <p className="text-gray-300"><span className="font-medium">Owner:</span> {videoDetails.video_owner}</p>
                {videoDetails.video_uri && (
                  <p className="text-gray-300 mt-1">
                    <span className="font-medium">Video URI:</span>{" "}
                    <a href={videoDetails.video_uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                      {videoDetails.video_uri}
                    </a>
                  </p>
                )}
              </div>
            )}
            
            {/* Always show minting status and button */}
            <div className="mb-2">
              {!videoDetails.video_owner && (
                <p className="text-yellow-400 mb-2 text-sm">This video doesn&apos;t have an owner yet.</p>
              )}
              
              {mintSuccess ? (
                <div className="p-2 bg-green-800/30 border border-green-700 rounded-md text-green-300 text-sm">
                  <p>NFT minted successfully!</p>
                  <div className="mt-2 space-y-1">
                    {txHash && (
                      <p>
                        <a 
                          href={`https://alfajores.celoscan.io/tx/${txHash}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center"
                        >
                          View transaction on Celoscan
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </p>
                    )}
                    {tokenId && (
                      <p>
                        <a 
                          href={`https://alfajores.celoscan.io/token/${ALFAJORES_CONTRACT_ADDRESS}?a=${tokenId}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center"
                        >
                          View NFT on Celoscan
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleMintNFT}
                  disabled={isMinting || !videoDetails.video_uri}
                  className={`px-3 py-1.5 text-sm bg-gradient-to-r from-primary to-accent text-white rounded-md 
                    ${isMinting || !videoDetails.video_uri ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} 
                    transition-opacity flex items-center`}
                >
                  {isMinting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting...
                    </>
                  ) : 'Mint This Video'}
                </button>
              )}
              
              {mintError && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-xs">
                  {mintError}
                </div>
              )}
              
              {!videoDetails.video_uri && (
                <div className="mt-2 text-amber-400 text-xs">
                  You need to render the video first before minting
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-5 gap-2">
            <button 
              onClick={() => router.push('/my-videos')}
              className="px-3 py-1.5 text-sm bg-gray-800 text-gray-200 rounded hover:bg-gray-700 transition-colors"
            >
              Back to My Videos
            </button>
            
            <button 
              onClick={handleRenderVideo}
              disabled={renderLoading}
              className={`px-3 py-1.5 text-sm ${renderLoading ? 'bg-blue-400' : 'bg-blue-600'} text-white rounded hover:bg-blue-700 transition-colors flex items-center`}
            >
              {renderLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Rendering...
                </>
              ) : 'Render Video'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

export default function VideoPage() {
  const { videoId } = useParams();
  
  return <VideoStatusPage videoId={videoId as string} />;
} 