import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

// Helper to shorten address for display
const shortenAddress = (address) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const Header = () => {
  const { account, active, connectWallet, disconnectWallet, isLoading, error } = useWeb3();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              <Link to="/">Auto Video Report</Link>
            </h1>
            <nav className="ml-8">
              <ul className="flex space-x-4">
                <li>
                  <Link to="/" className="hover:text-gray-300">Home</Link>
                </li>
                {active && (
                  <li>
                    <Link to="/dashboard" className="hover:text-gray-300">My Videos</Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          
          <div>
            {!active ? (
              <button 
                onClick={connectWallet} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="bg-gray-700 rounded-full px-4 py-2 text-sm">
                  {shortenAddress(account)}
                </span>
                <button 
                  onClick={disconnectWallet}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Display wallet connection errors */}
        {error && (
          <div className="mt-2 p-2 bg-red-700 text-white rounded text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 