import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { fetchAddressBlockchainData, fetchNftTransfers, fetchTokenTransfers } from '@/lib/celo-api';

import { generateTransactionReport } from '@/lib/llm';
import { TransactionReport } from '@/types/report';


// Environment and configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Database client
const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};


// Request body schema definition
const requestBodySchema = z.object({
  prompt: z.string().optional(),
  duration: z.number(),
  address: z.string(),
  report_address: z.string(),
  chain_id: z.number(),
  network_name: z.string(),
  balance: z.string(),
  transaction_count: z.number(),
  activity_type: z.string(),
});

// Database operations
async function saveVideoRequest(supabaseAdmin: SupabaseClient, 
  request_id: string,
  user_address: string,
  report_address: string,
  prompt: string,
  duration: number,
  status: string,
  chain_id: number,
  network_name: string,
  balance: string,
  transaction_count: number,
  intro_text: string,
  transactionReports:  TransactionReport[],
  outro_text: string
) {
  // Convert VideoRequestData to Record<string, unknown> to satisfy SupabaseClient type requirements
  const dbRecord: Record<string, unknown> = {
    request_id,
    user_address,
    prompt,
    duration,
    status,
    report_address,
    chain_id,
    network_name,
    balance,
    transaction_count,
    transaction_reports: transactionReports,
    intro_text,
    outro_text
  };
  
  const { error } = await supabaseAdmin
    .from('video_requests')
    .insert(dbRecord);
  console.log("database error", {error});
  if (error) {
    console.error('Database insert error:', error);
    throw error;
  }
  
  return { success: true };
}


// Error response formatting
function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Success response formatting
function createSuccessResponse(videoId: string) {
  return NextResponse.json({ 
    success: true, 
    videoId,
    message: 'Video generation request received and being processed'
  });
}

// Main handler
export async function executeHandler(request: NextRequest) {
  // Get Supabase admin client for this request
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    return createErrorResponse('Database connection failed. Check your environment variables.', 500);
  }

  const result = requestBodySchema.safeParse(await request.json());
  if (!result.success) {
    console.log(result.error);
    return createErrorResponse('error', 400);
  }

  const {
    activity_type,
    prompt,
    duration,
    address,
    report_address,
    chain_id,
    network_name,
    transaction_count
  } = result.data;

  console.log({result: result.data});
 
  let report;
  let blockchainData;
  if (activity_type === 'transactions') {
    blockchainData = await fetchAddressBlockchainData(address, duration);    
    console.log({blockchainData});
    report = await generateTransactionReport(prompt, duration, blockchainData.transactions);
    console.log({report});
  } else if (activity_type === 'nft') {
    blockchainData = await fetchNftTransfers(address, duration);
    console.log({blockchainData});
    report = await generateTransactionReport(prompt, duration, blockchainData.transactions);
    console.log({report});
  } else if (activity_type === 'tokens') {
    blockchainData = await fetchTokenTransfers(address, duration);
    console.log({blockchainData});
    report = await generateTransactionReport(prompt, duration, blockchainData.transactions);
    console.log({report});
  } else {
    throw new Error(`Invalid activity type: ${activity_type}`);
  }

  // Create a unique request ID and prepare database entry
  const videoId = uuidv4();
      
  // Prepare request data
  await saveVideoRequest(
    supabaseAdmin,
    videoId,
    address,
    report_address,
    prompt || 'General analysis',
    duration,
    'generating',
    chain_id,
    network_name,
    blockchainData.balance,
    transaction_count,
    report.intro_text,
    report.transaction_reports,
    report.outro_text
  );
  return createSuccessResponse(videoId);
} 

export async function POST(request: NextRequest) {
  try {
    return await executeHandler(request);
  } catch (error) {
    console.error('Error executing handler:', error);
    return createErrorResponse(error instanceof Error ? `Error: ${error.message}` : 'Error: Unknown error', 500);
  }
}