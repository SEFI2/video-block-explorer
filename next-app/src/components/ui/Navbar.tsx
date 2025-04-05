'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Import the Web3Context later when it's fully implemented
// import { useWeb3 } from '@/contexts/Web3Context';

// Modern dark theme Navbar component
const Navbar = () => {
  const pathname = usePathname();
  // Mobile menu state - currently not in use but will be needed for mobile responsive design
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Mock web3 context until it's fully implemented
  const web3Context = {
    account: undefined,
    active: false,
    isLoading: false,
    error: null,
    connectWallet: async () => {},
    disconnectWallet: async () => {},
  };
  
  // Format wallet address for display
  const formatAddress = (address: string | undefined): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check if a nav link is active
  const isActive = (path: string): boolean => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/new-video' && pathname === '/new-video') return true;
    if (path === '/' && pathname === '/new-video') return true;
    if (path === '/videos' && pathname === '/videos') return true;
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-card text-white shadow-lg mb-6 sticky top-0 z-50 py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <Link href="/" className="text-xl font-bold text-primary hover:text-primary-light transition">
            Auto Video Report
          </Link>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-primary-light transition ${
                isActive('/') ? 'text-primary font-semibold' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/new-video" 
              className={`hover:text-primary-light transition ${
                isActive('/new-video') ? 'text-primary font-semibold' : 'text-gray-300'
              }`}
            >
              Create Video
            </Link>
            <Link 
              href="/videos" 
              className={`hover:text-primary-light transition ${
                isActive('/videos') ? 'text-primary font-semibold' : 'text-gray-300'
              }`}
            >
              My Videos
            </Link>
          </div>
          
          {/* Connect Wallet button */}
          <div>
            {web3Context.active ? (
              <div className="flex items-center">
                <span className="bg-dark py-1 px-3 rounded-lg mr-2 text-sm">
                  {formatAddress(web3Context.account)}
                </span>
                <button 
                  onClick={() => web3Context.disconnectWallet()}
                  className="bg-red-700 hover:bg-red-800 text-white py-1 px-3 rounded-lg transition text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => web3Context.connectWallet()}
                disabled={web3Context.isLoading}
                className="btn btn-primary"
              >
                {web3Context.isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 