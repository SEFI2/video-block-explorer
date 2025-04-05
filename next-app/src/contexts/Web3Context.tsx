'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS, CONTRACT_ABIS } from '../constants/contracts';
import type { Web3ContextType } from '../types';

// Create a default context for SSR
const defaultContext: Web3ContextType = {
  account: undefined,
  active: false,
  isLoading: false,
  error: null,
  chainId: undefined,
  library: undefined,
  contracts: {},
  videoRequests: [],
  currentVideoStatus: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
};

// Initialize the MetaMask connector
// We're using a simpler approach for Next.js without the web3-react library
// Create the context
export const Web3Context = createContext<Web3ContextType | null>(null);

// Hook to use the Web3 context
export const useWeb3 = (): Web3ContextType => {
  // Always call useContext (following hooks rules)
  const context = useContext(Web3Context);
  
  // For server-side rendering, use the default context
  if (typeof window === 'undefined') {
    return defaultContext;
  }
  
  // For client-side rendering, enforce provider requirement
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  
  return context;
};

interface Web3ContextProviderProps {
  children: ReactNode;
}

// Client-side only wrapper component
const ClientWeb3Provider: React.FC<Web3ContextProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [provider, setProvider] = useState<unknown>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<{
    videoGenerator?: ethers.Contract;
    [key: string]: ethers.Contract | undefined;
  }>({});
  const [library, setLibrary] = useState<BrowserProvider | undefined>(undefined);
  const [videoRequests] = useState<string[]>([]);
  const [currentVideoStatus] = useState<string | null>(null);
  
  // Debug: Log connection state changes
  useEffect(() => {
    console.log('Web3Context connection state changed:', { 
      isActive, 
      account, 
      chainId,
      provider: provider ? 'Connected' : 'Not Connected'
    });
  }, [isActive, account, chainId, provider]);
  
  // Setup connection event listeners
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleConnect = () => {
      console.log('MetaMask connected event fired');
    };
    
    const handleDisconnect = () => {
      console.log('MetaMask disconnected event fired');
    };
    
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('MetaMask accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // User has disconnected all accounts
        localStorage.removeItem('wallet_auto_connect');
        // Force refresh to reset UI state
        window.location.reload();
      } else {
        setAccount(accounts[0]);
      }
    };
    
    const handleChainChanged = (chainId: string) => {
      console.log('MetaMask chain changed:', chainId);
      
      // Don't reload the page - this would disconnect the wallet
      // Instead, let the React components update based on the new chainId
      
      // Check if the new chain is supported
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      
      const isSupported = SUPPORTED_CHAINS.includes(newChainId);
      
      if (isSupported) {
        console.log(`Chain changed to supported network: ${newChainId}`);
      } else {
        console.log(`Chain changed to unsupported network: ${newChainId}`);
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('connect', handleConnect);
          window.ethereum.removeListener('disconnect', handleDisconnect);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
    return undefined;
  }, []);

  // Try to eagerly connect on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Wrap in a proper try/catch with handling for empty method errors
    const attemptEagerConnection = async () => {
      try {
        // Check if MetaMask is available before attempting connection
        if (window.ethereum && window.ethereum.isMetaMask) {
          console.log('Attempting eager connection to MetaMask...');
          
          // Check if user has explicitly disconnected
          const userDisconnected = localStorage.getItem('wallet_user_disconnected') === 'true';
          if (userDisconnected) {
            console.log('User has explicitly disconnected. Skipping automatic connection.');
            // Clear any remaining connection state
            setAccount(undefined);
            setIsActive(false);
            setLibrary(undefined);
            setProvider(null);
            setContracts({});
            setChainId(undefined);
            return;
          }
          
          // Set a flag in localStorage to remember that we've connected
          const shouldEagerlyConnect = localStorage.getItem('wallet_auto_connect') === 'true';
          
          // First check if already connected to avoid unnecessary requests
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          const isConnected = accounts && accounts.length > 0;
          
          if (isConnected && shouldEagerlyConnect) {
            setAccount(accounts[0]);
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdNum = parseInt(chainIdHex, 16);
            setChainId(chainIdNum);
            setIsActive(true);
            
            // Setup provider and library
            const web3Provider = new BrowserProvider(window.ethereum);
            setLibrary(web3Provider);
            setProvider(window.ethereum);
            
            // Initialize contracts with signer
            const signer = await web3Provider.getSigner();
            initializeContracts(web3Provider, signer);
            
            // Set the flag for next time
            localStorage.setItem('wallet_auto_connect', 'true');
            
            // Clear the explicit disconnection flag if it exists
            localStorage.removeItem('wallet_user_disconnected');
          } else if (shouldEagerlyConnect) {
            // Try to connect manually if we should auto-connect
            await connectWallet();
          } else {
            // Make sure we explicitly clear any state if not auto-connecting
            setAccount(undefined);
            setIsActive(false);
            setLibrary(undefined);
            setProvider(null);
            setContracts({});
            setChainId(undefined);
          }
        } else {
          console.debug('MetaMask not detected, skipping eager connection');
        }
      } catch (error) {
        console.debug('Failed to connect eagerly to MetaMask:', error);
        // Don't set error state here to avoid showing errors on page load
      }
    };
    
    attemptEagerConnection();
    // Note: connectWallet and initializeContracts are defined inside the component
    // and won't change between renders, so it's safe to exclude them from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize contracts
  const initializeContracts = (provider: BrowserProvider, signer: JsonRpcSigner) => {
    if (!chainId) return;
    
    const chainIdStr = chainId.toString();
    if (CONTRACT_ADDRESSES.VideoGenerator[chainIdStr]) {
      const videoGeneratorContract = new Contract(
        CONTRACT_ADDRESSES.VideoGenerator[chainIdStr],
        CONTRACT_ABIS.VideoGenerator,
        signer
      );
      
      setContracts(prev => ({
        ...prev,
        videoGenerator: videoGeneratorContract
      }));
    }
  };

  // Connect to wallet - ensuring account selection dialog appears
  const connectWallet = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to connect to wallet...');
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      }
      
      // Force MetaMask to show the account selection dialog by first checking accounts
      // This extra call helps trigger the popup more reliably
      const currentAccounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      
      console.log('Current accounts before connection:', currentAccounts);
      
      // Add a small delay to ensure MetaMask UI has time to respond
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now explicitly request accounts - this should trigger the popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      console.log('Selected accounts after connection request:', accounts);
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Get the current chainId
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdNum = parseInt(chainIdHex, 16);
        setChainId(chainIdNum);
        
        // Set active state
        setIsActive(true);
        
        // Setup provider and library
        const web3Provider = new BrowserProvider(window.ethereum);
        setLibrary(web3Provider);
        setProvider(window.ethereum);
        
        // Initialize contracts
        const signer = await web3Provider.getSigner();
        initializeContracts(web3Provider, signer);
        
        // Set the flag in localStorage for future auto-connection
        localStorage.setItem('wallet_auto_connect', 'true');
        
        // Clear the explicit disconnection flag if it exists
        localStorage.removeItem('wallet_user_disconnected');
        
        console.log('Wallet connected successfully!');
      } else {
        throw new Error('No accounts found. Permission to connect may have been denied.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Unknown error connecting to wallet');
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from wallet
  const disconnectWallet = async (): Promise<void> => {
    try {
      console.log('Disconnecting wallet...');
      
      // Clear all state
      setAccount(undefined);
      setIsActive(false);
      setLibrary(undefined);
      setProvider(null);
      setContracts({});
      setChainId(undefined);
      
      // Remove auto-connect flag
      localStorage.removeItem('wallet_auto_connect');
      
      // Set a flag indicating user has explicitly disconnected
      // This will be used to prevent automatic reconnection
      localStorage.setItem('wallet_user_disconnected', 'true');
      
      // For a cleaner disconnect experience, reload the page
      // This ensures all state is properly reset
      window.location.reload();
      
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Request video generation function
  const requestVideoGeneration = async (dataDuration: string, dataPrompt: string, targetAddress?: string) => {
    try {
      // First check if wallet is connected - still needed for authentication
      if (!isActive) {
        await connectWallet();
        // If still not active after attempting to connect, throw error
        if (!isActive) {
          throw new Error('Wallet not connected. Please connect your wallet and try again.');
        }
      }
      
      const finalTargetAddress = targetAddress || account;
      if (!finalTargetAddress) {
        throw new Error('No target address specified');
      }
      
      // Activity type - could be passed as a parameter in future
      const activityType = "default"; 
      
      console.log('Sending video generation request to backend...', {
        dataDuration,
        dataPrompt,
        finalTargetAddress,
        activityType
      });
      
      // Call backend API instead of smart contract
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: dataDuration,
          prompt: dataPrompt,
          walletAddress: finalTargetAddress,
          activityType: activityType
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data?.error || `API request failed with status ${response.status}`;
        console.error('Video generation API error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('Backend response:', data);
      
      return {
        success: true,
        videoId: data.videoId,
        txData: data.txData // Additional data from the backend
      };
    } catch (error) {
      console.error('Error requesting video generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request video generation'
      };
    }
  };

  // Request refund function
  const requestRefund = async (videoId: string) => {
    try {
      if (!isActive) {
        throw new Error('Wallet not connected');
      }
      
      // Call backend API instead of smart contract
      const response = await fetch(`/api/videos/${videoId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Refund response:', data);
      
      return {
        success: true,
        txData: data.txData
      };
    } catch (error) {
      console.error('Error requesting refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request refund'
      };
    }
  };

  // Acknowledge video function
  const acknowledgeVideo = async (videoId: string) => {
    try {
      if (!isActive) {
        throw new Error('Wallet not connected');
      }
      
      // Call backend API instead of smart contract
      const response = await fetch(`/api/videos/${videoId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Acknowledge response:', data);
      
      return {
        success: true,
        txData: data.txData
      };
    } catch (error) {
      console.error('Error acknowledging video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge video'
      };
    }
  };

  // Get video status function
  const getVideoStatus = async (videoId: string): Promise<number | null> => {
    try {
      // Call backend API instead of smart contract
      const response = await fetch(`/api/videos/${videoId}`);
      
      if (!response.ok) {
        console.error(`Failed to get video status: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log('Video status response:', data);
      
      // Convert status string to number equivalent to match existing interface
      const statusMap: {[key: string]: number} = {
        'pending': 0,
        'generating': 1,
        'completed': 2,
        'failed': 3,
        'refunded': 4
      };
      
      return data.video && data.video.status ? statusMap[data.video.status] || 0 : null;
    } catch (error) {
      console.error('Error getting video status:', error);
      return null;
    }
  };

  // Switch to Alfajores network
  const switchToAlfajoresNetwork = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaef3' }], // Alfajores chain ID in hex
      });
      return true;
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      if (typeof switchError === 'object' && switchError !== null && 'code' in switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaef3', // Alfajores chain ID in hex
                chainName: 'Alfajores Testnet',
                nativeCurrency: {
                  name: 'Celo',
                  symbol: 'CELO',
                  decimals: 18,
                },
                rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                blockExplorerUrls: ['https://alfajores.celoscan.io/'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Alfajores network to MetaMask:', addError);
          return false;
        }
      }
      console.error('Error switching to Alfajores network:', switchError);
      return false;
    }
  };
  
  // Create the context value to provide
  const contextValue: Web3ContextType = {
    account,
    active: isActive,
    isLoading,
    error,
    chainId,
    library,
    contracts,
    videoRequests,
    currentVideoStatus,
    connectWallet,
    disconnectWallet,
    requestVideoGeneration,
    requestRefund,
    acknowledgeVideo,
    getVideoStatus,
    switchToAlfajoresNetwork
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Main Web3Provider with client-side detection
export const Web3Provider: React.FC<Web3ContextProviderProps> = ({ children }) => {
  if (typeof window === 'undefined') {
    // On server, render children without provider
    return <>{children}</>;
  }
  
  // On client, use the full provider
  return <ClientWeb3Provider>{children}</ClientWeb3Provider>;
}; 