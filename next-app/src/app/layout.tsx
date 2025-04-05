'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import { Web3Provider } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright, faHeart } from '@fortawesome/free-solid-svg-icons';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

const Footer: React.FC = () => (
  <footer className="footer glass">
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faCopyright} className="mr-2 neon-text" />
          <p>© 2025 <span className="neon-text">Blockchain Video Explorer</span> | All rights reserved</p>
        </div>
        <div>
          <p className="flex items-center">
            Made with <FontAwesomeIcon icon={faHeart} className="mx-1" style={{color: 'var(--error)'}} /> for blockchain enthusiasts
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <div className="App">
            <Navbar />
            <main className="container">
              {children}
            </main>
            <Footer />
          </div>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  );
}
