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
  const [activityType, setActivityType] = useState<ActivityType>('transactions');
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrorsState>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { account, balance } = useWeb3();

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
    }
    return '';
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
          report_address: address,
          chain_id: 42220,
          network_name: 'Celo Network',
          balance: '1000',
          transaction_count: 100,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setSubmissionError(data.error || data.message || 'Failed to generate video');
        return {
          success: false,
          error: data.error || data.message || 'Failed to generate video',
        };
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
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="w-full max-w-4xl animate-slide-up backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/5">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Blockchain Activity Visualizer
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Create a beautiful video visualization of your on-chain activity with just a few clicks
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration Selection */}
              <div className="bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
                <label htmlFor="dataDuration" className="form-label flex items-center text-base mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mr-3">
                    <FontAwesomeIcon icon={faClock} className="text-primary" />
                  </div>
                  <span>Time Period</span>
                </label>
                <select
                  id="dataDuration"
                  value={dataDuration}
                  onChange={(e) => setDataDuration(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  {durationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} {option === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-2 text-gray-400">
                  Select the timeframe for your on-chain data visualization
                </p>
              </div>
              
              {/* Target Address */}
              <div className="bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
                <label htmlFor="targetAddress" className="form-label flex items-center text-base mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mr-3">
                    <FontAwesomeIcon icon={faUser} className="text-primary" />
                  </div>
                  <span>Wallet Address</span>
                </label>
                <input
                  id="targetAddress"
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  disabled={isLoading}
                  placeholder={account ? "Using connected wallet address" : "0x..."}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {formErrors.targetAddress && (
                  <p className="text-xs mt-2 text-red-400">
                    {formErrors.targetAddress}
                  </p>
                )}
                <p className="text-xs mt-2 text-gray-400">
                  {account ? "Using connected wallet by default" : "Enter an Ethereum address to analyze"}
                </p>
              </div>
            </div>
            
            {/* Activity Type Selection */}
            <div className="bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
              <label className="form-label flex items-center text-base mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mr-3">
                  <FontAwesomeIcon icon={faSatelliteDish} className="text-primary" />
                </div>
                <span>Activity Type</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activityOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setActivityType(option.value as ActivityType)}
                    className={`relative cursor-pointer rounded-xl transition-all duration-300 ${
                      activityType === option.value
                        ? 'bg-primary/20 border-2 border-primary shadow-md shadow-primary/20'
                        : 'bg-gray-700/30 border border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activityType === option.value ? 'bg-primary/30' : 'bg-gray-700'
                        }`}>
                          <FontAwesomeIcon icon={option.icon} className={
                            activityType === option.value ? 'text-white' : 'text-gray-300'
                          } />
                        </div>
                        <span className={`ml-2 font-medium ${
                          activityType === option.value ? 'text-white' : 'text-gray-300'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </div>
                    {activityType === option.value && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Custom Data Prompt */}
            <div className="bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
              <label htmlFor="customPrompt" className="form-label flex items-center text-base mb-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mr-3">
                  <FontAwesomeIcon icon={faComment} className="text-primary" />
                </div>
                <span>Custom Data Prompt</span>
              </label>
              <textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isLoading}
                placeholder="E.g., Analyze and visualize my NFT trading activity with a focus on profit/loss patterns..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[100px] resize-none"
              />
              {formErrors.customPrompt && (
                <p className="text-xs mt-2 text-red-400">
                  {formErrors.customPrompt}
                </p>
              )}
              <div className="flex mt-2 text-xs text-gray-400">
                <FontAwesomeIcon icon={faInfoCircle} className="text-primary mt-1 mr-2 flex-shrink-0" />
                <p>
                  Optionally provide specific instructions on what data to analyze and visualize. 
                  If left empty, we&apos;ll use a default prompt based on your selected activity type.
                </p>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-medium transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faVideoCamera} className="mr-2" />
                    <span>Generate Video Visualization</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Error Message */}
            {submissionError && (
              <div className="animate-fade-in mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-red-400 text-sm font-medium">
                  {submissionError}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return <VideoGenerationForm />;
}
