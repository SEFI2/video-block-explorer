'use client'; // Add this directive for client-side hooks and event handlers

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Remove useRouter since it's not used
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, faFilm, faFlask, faWallet, faRightFromBracket, 
  faGlobe 
} from '@fortawesome/free-solid-svg-icons';
// IMPORTANT: Adjust these import paths based on your actual project structure in next-app
import { useWeb3 } from '../contexts/Web3Context'; 

// Define directly here instead of importing
const SUPPORTED_CHAINS = {
  LOCALHOST: 1337,
  SEPOLIA: 11155111,
  ALFAJORES: 44787
};

// Define minimal context type needed for this component
interface Web3ContextType {
  account?: string;
  active: boolean;
  isLoading: boolean;
  error: Error | string | null;
  chainId?: number;
  videoRequests: string[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      selectedAddress?: string;
      isMetaMask?: boolean;
      chainId?: string;
    };
  }
}

// This component safely handles client-side only Web3 access
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

// Web3 context consumer that only runs on client-side
const Web3Consumer: React.FC<{
  children: (context: Web3ContextType) => React.ReactNode;
  fallback: Web3ContextType;
}> = ({ children, fallback }) => {
  try {
    const web3Context = useWeb3();
    
    if (web3Context.error && (
      web3Context.error.toString().includes('could not detect network') || 
      web3Context.error.toString().includes('network changed')
    )) {
      console.warn('Network detection error:', web3Context.error);
      
      return <>{children({
        ...fallback,
        error: web3Context.error,
        isLoading: web3Context.isLoading,
        connectWallet: web3Context.connectWallet,
        disconnectWallet: web3Context.disconnectWallet
      })}</>;
    }
    
    return <>{children(web3Context)}</>;
  } catch (error) {
    console.log('Web3Context not available or error:', error);
    return <>{children(fallback)}</>;
  }
};

// Safe wrapper that combines ClientOnly and Web3Consumer
const SafeWeb3Consumer: React.FC<{
  children: (context: Web3ContextType) => React.ReactNode;
  fallback: Web3ContextType;
}> = ({ children, fallback }) => {
  return (
    <ClientOnly>
      <Web3Consumer fallback={fallback}>
        {children}
      </Web3Consumer>
    </ClientOnly>
  );
};

// Modern Dark Theme Navbar with glowing effects
const Navbar: React.FC = () => {
  const pathname = usePathname(); // Get current path
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on a demo video page
  const isDemoPage = pathname === '/mock-video' || pathname?.startsWith('/demo/');
  
  // Fallback context (remains the same)
  const fallbackContext: Web3ContextType = {
    account: undefined,
    active: false,
    isLoading: false,
    error: null,
    chainId: undefined,
    videoRequests: [],
    connectWallet: async () => {},
    disconnectWallet: async () => {},
  };
  
  // Format wallet address (remains the same)
  const formatAddress = (address: string | undefined): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check if a nav link is active (using pathname instead of router.pathname)
  const isActive = (path: string): boolean => {
    if (!pathname) return false;
    
    // Exact match for home page
    if (path === '/' && pathname === '/') return true;
    // Handle non-root paths, avoiding partial matches like /my matching /my-videos
    if (path !== '/' && pathname === path) return true;
    if (path !== '/' && pathname.startsWith(path + '/')) return true; // Match sub-paths like /demo/video1
    // Special case for demo pages if needed
    if (path.startsWith('/demo/') && pathname.startsWith('/demo/')) return true;
    if (path === '/mock-video' && pathname === '/mock-video') return true;

    return false;
  };

  // Toggle dropdown menu (remains the same)
  const toggleDropdown = () => {
    setShowDemoDropdown(!showDemoDropdown);
  };

  // Close dropdown when clicking outside (Use useEffect for client-side behavior)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDemoDropdown(false);
      }
    };
    
    // Only add listener if dropdown is shown
    if (showDemoDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDemoDropdown]); // Re-run effect when showDemoDropdown changes

  return (
    <SafeWeb3Consumer fallback={fallbackContext}>
      {({ account, active, connectWallet, disconnectWallet, isLoading, chainId, error }) => {
          
        const isSepoliaNetwork = chainId === SUPPORTED_CHAINS.SEPOLIA;
        const isLocalNetwork = chainId === SUPPORTED_CHAINS.LOCALHOST;
        const isAlfajoresNetwork = chainId === SUPPORTED_CHAINS.ALFAJORES;
        
        const getNetworkName = () => {
          if (isLocalNetwork) return "Localhost";
          if (isAlfajoresNetwork) return "Alfajores Testnet";
          return chainId ? `Network ID: ${chainId}` : "Unknown Network";
        };
        if (error) {
          console.error('Web3 error:', error);
        }
        return (
          <>            
            
            <nav className="sticky top-0 z-40 bg-black/50 backdrop-blur-lg border-b border-white/10 shadow-lg">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Logo and brand name */}
                    <Link href="/" className="flex items-center gap-2 group">
                      <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg transform group-hover:scale-110 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <FontAwesomeIcon icon={faVideo} className="text-white text-lg z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                        Blockchain Video Explorer
                      </span>
                    </Link>
                    
                    {/* Network Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                      isAlfajoresNetwork 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-[0_0_10px_rgba(20,184,166,0.5)]' 
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      <FontAwesomeIcon icon={faGlobe} className={isAlfajoresNetwork ? 'animate-pulse' : ''} />
                      {getNetworkName()}
                      {isAlfajoresNetwork && <span>✓</span>}
                    </div>
                  </div>

                  {/* Center nav links */}
                  <div className="hidden md:flex items-center space-x-1">
                    {active && (
                      <Link href="/my-videos" className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive('/my-videos')
                          ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}>
                        <FontAwesomeIcon icon={faFilm} className="mr-2" />
                        My Videos
                      </Link>
                    )}
                    
                    <Link href="/all-videos" className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive('/all-videos')
                          ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}>
                        <FontAwesomeIcon icon={faFilm} className="mr-2" />
                        All Videos
                      </Link>
                
                
                  </div>
                  
                  {/* Right section - wallet */}
                  <div className="flex items-center gap-3">
                    {isDemoPage && (
                      <span className="px-2 py-1 bg-purple-600/30 border border-purple-500/30 rounded-md text-xs font-medium text-purple-300">
                        Demo Mode
                      </span>
                    )}
                    
                    {!isDemoPage && (
                      <>
                        {active && account ? (
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                              isSepoliaNetwork || isAlfajoresNetwork || isLocalNetwork
                                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                                : 'bg-red-900/20 border border-red-500/30'
                            }`}>
                              <FontAwesomeIcon icon={faWallet} className="mr-2 text-blue-400" />
                              <span className="font-mono">{formatAddress(account)}</span>
                              {!(isSepoliaNetwork || isAlfajoresNetwork || isLocalNetwork) && 
                                <span className="ml-1.5 text-yellow-500">⚠️</span>
                              }
                            </div>
                            <button 
                              onClick={disconnectWallet}
                              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 transition-colors"
                              title="Disconnect Wallet"
                            >
                              <FontAwesomeIcon icon={faRightFromBracket} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={connectWallet}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] transform hover:scale-105 transition-all duration-200 flex items-center"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faWallet} className="mr-2" />
                                <span>Connect Wallet</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                    
                    
                    {/* Mobile menu */}
                    <div className="md:hidden">
                      <button 
                        onClick={toggleDropdown}
                        className="p-2 rounded-lg bg-gray-800 text-white"
                        aria-label="Toggle Menu"
                      >
                        <span className="block w-5 h-0.5 bg-white mb-1"></span>
                        <span className="block w-5 h-0.5 bg-white mb-1"></span>
                        <span className="block w-5 h-0.5 bg-white"></span>
                      </button>
                      
                      {showDemoDropdown && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-4 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-xl z-50"
                        >
                          <Link href="/my-videos" className={`block px-4 py-2 text-sm ${
                            isActive('/my-videos')
                              ? 'bg-blue-600/20 text-blue-400' 
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}>
                            <FontAwesomeIcon icon={faFilm} className="mr-2" />
                            Videos
                          </Link>
                          
                          <Link href="/mock-video" className={`block px-4 py-2 text-sm ${
                            isActive('/mock-video')
                              ? 'bg-purple-600/20 text-purple-400' 
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}>
                            <FontAwesomeIcon icon={faFlask} className="mr-2" />
                            Demo
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </>
        );
      }}
    </SafeWeb3Consumer>
  );
};

export default Navbar;