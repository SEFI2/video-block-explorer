import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { fetchAddressBlockchainData } from '@/lib/celo-api';

import { generateVideoScript } from '@/lib/llm';

interface VideoRequestData {
  request_id: string;
  user_address: string;
  prompt: string;
  duration: number;
  status: string;
  request_timestamp: string;
  generated_text: string;
}







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
  prompt: z.string(),
  duration: z.number(),
  address: z.string(),
});


// Database operations
async function saveVideoRequest(supabaseAdmin: SupabaseClient, 
  request_id: string,
  user_address: string,
  prompt: string,
  duration: number,
  status: string,
  request_timestamp: string,
  generated_text: string
) {
  // Convert VideoRequestData to Record<string, unknown> to satisfy SupabaseClient type requirements
  const dbRecord: Record<string, unknown> = {
    request_id,
    user_address,
    prompt,
    duration,
    status,
    request_timestamp,
    generated_text
  };
  
  const { error } = await supabaseAdmin
    .from('video_requests')
    .insert(dbRecord);
  
  if (error && error.details) {
    console.error('Database insert error:', error.details);
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

  const { prompt, duration, address } = result.data;
  console.log(result.data);
 
  const blockchainData = await fetchAddressBlockchainData(address, duration);    
  console.log(blockchainData);

    const scriptData = await generateVideoScript(prompt, duration, blockchainData.transactions);
      
  // Create a unique request ID and prepare database entry
  const videoId = uuidv4();
  const now = new Date().toISOString();
      
  // Prepare request data
  await saveVideoRequest(supabaseAdmin, videoId, address, prompt, duration, 'generating', now, scriptData.script);
  return createSuccessResponse(videoId);
} 

export async function POST(request: NextRequest) {
  try {
    return await executeHandler(request);
  } catch (error) {
    console.error('Error executing handler:', error);
    return createErrorResponse('Internal server error', 500);
  }
}