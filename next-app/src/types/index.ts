import { BrowserProvider, Contract } from 'ethers';

// Ethereum Provider type
export interface Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  selectedAddress?: string;
  isMetaMask?: boolean;
  chainId?: string;
}

// Video statuses
export enum VideoStatus {
  Requested = 0,
  Processing = 1,
  PreviewReady = 2,
  Rendering = 3,
  Completed = 4,
  Failed = 5,
  Refunded = 6,
  Acknowledged = 7
}

// Video data structure
export interface VideoData {
  id: string;
  status: VideoStatus;
  prompt: string;
  duration: string;
  previewUrl: string;
  finalUrl: string;
  createdAt: number;
  updatedAt: number;
}

// Contract interface
export interface Contracts {
  videoGenerator?: Contract;
  marketplace?: Contract;
  [key: string]: Contract | undefined;
}

// Form error state
export interface FormErrorsState {
  targetAddress?: string;
  customPrompt?: string;
  [key: string]: string | undefined;
}

// Transaction data structure
export interface TransactionData {
  timestamp: string;
  type: string;
  status: string;
  [key: string]: unknown;
}

// Video generation response
export interface VideoGenerationResponse {
  success: boolean;
  videoId?: string;
  txData?: TransactionData;
  txHash?: string;
  error?: string;
}

// Refund response
export interface RefundResponse {
  success: boolean;
  txData?: TransactionData;
  txHash?: string;
  error?: string;
}

// Acknowledge response
export interface AcknowledgeResponse {
  success: boolean;
  txData?: TransactionData;
  txHash?: string;
  error?: string;
}

// Status label interface for UI components
export interface StatusLabel {
  text: string;
  color: string;
}

// Web3 context type
export interface Web3ContextType {
  account?: string;
  active: boolean;
  isLoading: boolean;
  error: Error | string | null;
  chainId?: number;
  library?: BrowserProvider;
  contracts: Contracts;
  videoRequests: string[];
  currentVideoStatus: VideoStatus | string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

export interface VideoRequest {
  requestId: string;
  status: VideoStatus;
  creator: string;
  dataDuration: string;
  dataPrompt: string;
  previewUrl?: string;
  finalUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// Status color map
export interface StatusColor {
  [key: number]: string;
} 