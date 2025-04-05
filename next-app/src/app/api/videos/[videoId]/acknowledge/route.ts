import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a direct Supabase client instance for this API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Function to get Supabase admin client
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
import { z } from 'zod';

const bodySchema = z.object({
  message: z.string(),
  title: z.string(),
});
export async function POST(
  request: Request,
) {
  const videoId = bodySchema.parse(request.body);
  
  // Get Supabase admin client for this request
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database connection failed. Check your environment variables.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { walletAddress } = body;
    
    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Check if video exists and belongs to the user
    const { data: videoData, error: videoError } = await supabaseAdmin
      .from('video_requests')
      .select('*')
      .eq('request_id', videoId)
      .eq('user_address', walletAddress)
      .single();
    
    if (videoError || !videoData) {
      return NextResponse.json(
        { error: 'Video not found or does not belong to this wallet' },
        { status: 404 }
      );
    }
    
    // Check if video can be acknowledged (not already acknowledged or refunded)
    if (videoData.status === 'acknowledged') {
      return NextResponse.json(
        { error: 'Video has already been acknowledged' },
        { status: 400 }
      );
    }
    
    if (videoData.status === 'refunded') {
      return NextResponse.json(
        { error: 'Video has been refunded and cannot be acknowledged' },
        { status: 400 }
      );
    }
    
    // Only completed videos can be acknowledged
    if (videoData.status !== 'completed') {
      return NextResponse.json(
        { error: 'Video is not ready to be acknowledged' },
        { status: 400 }
      );
    }
    
    const now = new Date().toISOString();
    
    // Update video status to acknowledged
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .update({
        status: 'acknowledged',
        updated_at: now
      })
      .eq('request_id', videoId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create transaction data (mock, would be real in production)
    const txData = {
      timestamp: now,
      type: 'video_acknowledge',
      status: 'completed'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Video acknowledged successfully',
      txData,
      video: data
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to acknowledge video';
      
    console.error('Error acknowledging video:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 