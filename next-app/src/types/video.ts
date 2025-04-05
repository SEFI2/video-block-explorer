export enum VideoStatus {
  Requested = 0,
  Processing = 1,
  PreviewReady = 2,
  Rendering = 3,
  Completed = 4,
  Failed = 5,
  Refunded = 6
}

export interface VideoRequest {
  id: number;
  request_id: string;
  user_address: string;
  prompt: string;
  duration: string;
  deposit: string;
  status: VideoRequestStatus;
  generated_text?: string;
  request_timestamp: string;
  tx_hash: string;
  created_at: string;
  updated_at: string;
}

export interface VideoData {
  id: string;
  status: VideoStatus;
  prompt: string;
  duration: string;
  previewUrl?: string;
  finalUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type VideoRequestStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed';

export interface CreateVideoRequestParams {
  prompt: string;
  duration: string;
  deposit: string;
  user_address: string;
  tx_hash: string;
}

export interface StatusLabel {
  [key: number]: string;
}

export interface StatusColor {
  [key: number]: string;
}

export interface FormErrorsState {
  [key: string]: string;
} 