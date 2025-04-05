'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormErrorsState } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, faComment, faInfoCircle, 
  faVideoCamera, faSatelliteDish, faUser, faChevronDown, 
  faExchangeAlt, faImage, faFileContract, faLayerGroup, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { useWeb3 } from '../contexts/Web3Context';

type ActivityType = 
  | 'transactions' 
  | 'nft' 
  | 'contracts' 
  | 'defi'
  | 'all';

const VideoGenerationForm: React.FC = () => {
  const [dataDuration, setDataDuration] = useState<number>(7);
  const [activityType, setActivityType] = useState<ActivityType>('all');
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrorsState>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { account } = useWeb3();

  // Set the default target address to the connected wallet address
  useEffect(() => {
    if (account) {
      setTargetAddress(account);
    }
  }, [account]);

  // Duration options
  const durationOptions: number[] = [
    7,
    30,
    90,
    365,
    1000
  ];

  // Activity type options with descriptions
  const activityOptions = [
    { 
      value: 'transactions', 
      label: 'Transaction History', 
      icon: faExchangeAlt,
      description: 'Visualize your transaction patterns and ETH flow over time'
    },
    { 
      value: 'nft', 
      label: 'NFT Interactions', 
      icon: faImage,
      description: 'Showcase your NFT purchases, sales, and collections'
    },
    { 
      value: 'contracts', 
      label: 'Smart Contract Interactions', 
      icon: faFileContract,
      description: 'Display interactions with smart contracts and dapps'
    },
    { 
      value: 'defi', 
      label: 'DeFi Activity', 
      icon: faChartLine,
      description: 'Highlight liquidity provisions, loans, and yield farming'
    },
    { 
      value: 'all', 
      label: 'Complete Profile', 
      icon: faLayerGroup,
      description: 'Create a comprehensive overview of all on-chain activity'
    }
  ];

  // Generate data prompt from activity type
  const generateDataPrompt = (): string => {
    if (showAdvanced && customPrompt.trim()) {
      return customPrompt.trim();
    }
    
    // Base prompt on selected activity type
    switch(activityType) {
      case 'transactions':
        return `Analyze and visualize Ethereum transaction history for the ${dataDuration}, focusing on ETH transfers, frequency patterns, and significant transactions.`;
      case 'nft':
        return `Create a visual representation of NFT activity for the ${dataDuration}, highlighting collections, purchases, sales, and overall NFT engagement.`;
      case 'contracts':
        return `Visualize smart contract interactions for the ${dataDuration}, showcasing dapps used, contract calls, and protocol engagement.`;
      case 'defi':
        return `Generate a visual story of DeFi activities for the ${dataDuration}, including lending, borrowing, yield farming, and liquidity provisions.`;
      case 'all':
      default:
        return `Create a comprehensive visualization of all on-chain activity for the ${dataDuration}, including transactions, NFTs, smart contracts, and DeFi.`;
    }
  };

  // Function to request video generation via API
  const requestVideoGeneration = async (
    duration: number,
    prompt: string,
    address: string
  ): Promise<{ success: boolean; videoId?: string; error?: string }> => {
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          prompt,
          address,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate video');
      }
      
      return {
        success: true,
        videoId: data.videoId,
      };
    } catch (error) {
      console.error('Error generating video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Clear any previous submission errors
    setSubmissionError(null);
    
    // Use connected wallet address if no target address is provided
    const addressToUse = targetAddress || account;
    
    // Validate that we have an address to use
    if (!addressToUse) {
      setSubmissionError('Please connect your wallet or enter a target address');
      return;
    }
       
    // Get the appropriate data prompt
    const dataPrompt = generateDataPrompt();
    
    try {
      setIsLoading(true);
      const result = await requestVideoGeneration(dataDuration, dataPrompt, addressToUse);
      
      if (result.success && result.videoId) {
        // Redirect to status page with the video ID, using Next.js router
        router.push(`/video/${result.videoId}`);
      } else {
        // Set error in state instead of showing alert
        setSubmissionError(result.error || 'Failed to request video generation');
      }
    } catch (error) {
      console.error('Error in video generation:', error);
      // Set error in state instead of showing alert
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
      setSubmissionError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-gradient animate-slide-up p-4">
      <form onSubmit={handleSubmit} className="glass p-4 rounded">
        <div className="form-group">
          <label htmlFor="dataDuration" className="form-label flex items-center glow-text">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            Data Duration (days)
          </label>
          <select
            id="dataDuration"
            value={dataDuration}
            onChange={(e) => setDataDuration(parseInt(e.target.value))}
            disabled={isLoading}
            className="form-input"
          >
            {durationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="text-sm mt-1" style={{color: 'var(--text-secondary)'}}>
            Select the timeframe for the on-chain data you want to visualize.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="targetAddress" className="form-label flex items-center glow-text">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Target Address (Optional)
          </label>
          <input
            id="targetAddress"
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            disabled={isLoading}
            placeholder={account ? "Using connected wallet address" : "0x..."}
            className="form-input"
          />
          {formErrors.targetAddress && (
            <p className="text-sm mt-1" style={{color: 'var(--error)'}}>
              {formErrors.targetAddress}
            </p>
          )}
          <p className="text-sm mt-1" style={{color: 'var(--text-secondary)'}}>
            Using connected wallet address by default. You can enter a different address to generate a video for another wallet.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="activityType" className="form-label flex items-center glow-text">
            <FontAwesomeIcon icon={faSatelliteDish} className="mr-2" />
            Activity Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {activityOptions.map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded cursor-pointer transition-all ${
                  activityType === option.value
                    ? 'card-dark glow-border'
                    : 'glass'
                }`}
                onClick={() => setActivityType(option.value as ActivityType)}
              >
                <div className="flex items-center mb-1">
                  <FontAwesomeIcon icon={option.icon} className="mr-2" style={{color: 'var(--primary-light)'}} />
                  <span className="font-medium">{option.label}</span>
                </div>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{option.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center p-2 text-sm border-none bg-transparent"
            style={{color: 'var(--primary-light)'}}
          >
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            />
            Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="card-dark p-3 mt-2 animate-fade-in">
              <div className="form-group">
                <label htmlFor="customPrompt" className="form-label flex items-center glow-text">
                  <FontAwesomeIcon icon={faComment} className="mr-2" />
                  Custom Data Prompt
                </label>
                <textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isLoading}
                  placeholder="E.g., Analyze and visualize my NFT trading activity with a focus on profit/loss patterns, top collections, and market timing..."
                  className="form-input h-24"
                />
                {formErrors.customPrompt && (
                  <p className="text-sm mt-1" style={{color: 'var(--error)'}}>
                    {formErrors.customPrompt}
                  </p>
                )}
                <div className="flex items-start mt-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-1 flex-shrink-0" style={{color: 'var(--primary-light)'}} />
                  <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    You can provide a custom prompt for more specific instructions on what data to analyze and visualize.
                    If left empty, a default prompt based on your selected Activity Type will be used.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`btn btn-primary w-full max-w-md ${isLoading ? 'opacity-75' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="spinner mr-2"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faVideoCamera} className="mr-2" />
                <span>Generate Video</span>
              </>
            )}
          </button>
        </div>
        
        {/* Display submission errors below the button */}
        {submissionError && (
          <div className="mt-4 p-3 rounded animate-fade-in" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)'}}>
            <p className="text-sm text-center font-medium" style={{color: 'var(--error)'}}>
              {submissionError}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default function HomePage() {
  return <VideoGenerationForm />;
}
