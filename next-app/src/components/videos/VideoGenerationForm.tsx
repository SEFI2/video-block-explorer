'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FormErrorsState } from '@/types/video';
// Import the Web3Context later when it's fully implemented
// import { useWeb3 } from '@/contexts/Web3Context';

type ActivityType = 
  | 'transactions' 
  | 'nft' 
  | 'contracts' 
  | 'defi'
  | 'all';

interface VideoGenerationFormProps {
  onSubmitStart?: () => void;
  onSubmitSuccess?: (videoId: string) => void;
  onSubmitError?: (message: string) => void;
  isSubmitting?: boolean;
}

const VideoGenerationForm: React.FC<VideoGenerationFormProps> = ({
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
  isSubmitting: externalIsSubmitting
}) => {
  // Will use useWeb3 when implemented
  // const { account, active, requestVideoGeneration, isLoading, error } = useWeb3();
  
  // Mock web3 context for now
  const active = false;
  const account = undefined;
  const [internalIsLoading, setInternalIsLoading] = useState<boolean>(false);
  const contextError = null;
  
  const isLoading = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsLoading;
  
  const [dataDuration, setDataDuration] = useState<string>('last 30 days');
  const [activityType, setActivityType] = useState<ActivityType>('all');
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrorsState>({});
  const router = useRouter();

  // Duration options
  const durationOptions: string[] = [
    'last 7 days',
    'last 30 days',
    'last 90 days',
    'last year',
    'all time'
  ];

  // Activity type options with descriptions
  const activityOptions = [
    { 
      value: 'transactions', 
      label: 'Transaction History', 
      description: 'Visualize your transaction patterns and ETH flow over time'
    },
    { 
      value: 'nft', 
      label: 'NFT Interactions', 
      description: 'Showcase your NFT purchases, sales, and collections'
    },
    { 
      value: 'contracts', 
      label: 'Smart Contract Interactions', 
      description: 'Display interactions with smart contracts and dapps'
    },
    { 
      value: 'defi', 
      label: 'DeFi Activity', 
      description: 'Highlight liquidity provisions, loans, and yield farming'
    },
    { 
      value: 'all', 
      label: 'Complete Profile', 
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

  // Function to validate form inputs
  const validateForm = (): boolean => {
    const errors: FormErrorsState = {};
    
    // Validate target address if provided
    if (targetAddress) {
      if (!targetAddress.startsWith('0x') || targetAddress.length !== 42) {
        errors.targetAddress = 'Invalid Ethereum address format';
      }
    }
    
    // Validate custom prompt only if advanced options are shown
    if (showAdvanced && customPrompt) {
      if (customPrompt.length < 10) {
        errors.customPrompt = 'Custom prompt should be at least 10 characters';
      } else if (customPrompt.length > 500) {
        errors.customPrompt = 'Custom prompt should not exceed 500 characters';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!active || !account) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      // Call onSubmitStart callback if provided
      if (onSubmitStart) {
        onSubmitStart();
      } else {
        setInternalIsLoading(true);
      }
      
      // Get the appropriate data prompt
      const dataPrompt = generateDataPrompt();
      console.log('Generated prompt:', dataPrompt);
      
      // Mock implementation - will use the actual requestVideoGeneration when Web3Context is implemented
      // const result = await requestVideoGeneration(dataDuration, dataPrompt, targetAddress || undefined);
      
      // For demo, simulate success with a random ID
      const videoId = Math.floor(Math.random() * 1000).toString();
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call onSubmitSuccess callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(videoId);
      } else {
        setInternalIsLoading(false);
        router.push(`/video/${videoId}`);
      }
    } catch (err: unknown) {
      console.error('Error in video generation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request';
      
      // Call onSubmitError callback if provided
      if (onSubmitError) {
        onSubmitError(errorMessage);
      } else {
        setInternalIsLoading(false);
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg animate-fade-in">      
      {!active && (
        <div className="bg-gray-800 p-4 mb-6 rounded-lg border border-blue-500">
          <div className="flex items-center text-gray-300">
            <span>Please connect your wallet to generate videos.</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
        <div className="mb-4">
          <label htmlFor="dataDuration" className="block text-blue-400 mb-2 font-medium">
            Data Duration
          </label>
          <select
            id="dataDuration"
            value={dataDuration}
            onChange={(e) => setDataDuration(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {durationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="text-sm mt-1 text-gray-400">
            Select the timeframe for the on-chain data you want to visualize.
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="targetAddress" className="block text-blue-400 mb-2 font-medium">
            Target Address (Optional)
          </label>
          <input
            type="text"
            id="targetAddress"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            disabled={isLoading}
            placeholder="0x..."
            className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formErrors.targetAddress && (
            <p className="text-red-400 text-sm mt-1">{formErrors.targetAddress}</p>
          )}
          <p className="text-sm mt-1 text-gray-400">
            If not provided, the connected wallet address will be used.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-blue-400 mb-2 font-medium">
            Activity Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activityOptions.map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-md cursor-pointer transition ${
                  activityType === option.value
                    ? 'bg-blue-800 border-2 border-blue-500'
                    : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => setActivityType(option.value as ActivityType)}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm mt-1 text-gray-300">{option.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-400 underline hover:text-blue-300"
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
          
          {showAdvanced && (
            <div className="mt-3">
              <label htmlFor="customPrompt" className="block text-blue-400 mb-2 font-medium">
                Custom Prompt
              </label>
              <textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a custom prompt to generate your video..."
              ></textarea>
              {formErrors.customPrompt && (
                <p className="text-red-400 text-sm mt-1">{formErrors.customPrompt}</p>
              )}
              <p className="text-sm mt-1 text-gray-400">
                Provide specific instructions for generating your video.
              </p>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading || !active}
            className={`px-6 py-3 rounded-md font-medium transition ${
              active
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Processing...' : 'Generate Video'}
          </button>
          
          {contextError && (
            <p className="text-red-400 mt-4">{contextError}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default VideoGenerationForm; 