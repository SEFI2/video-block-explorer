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

export async function POST(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  const videoId = params.videoId;
  
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
    
    // Check if video can be refunded (not already refunded or acknowledged)
    if (videoData.status === 'refunded') {
      return NextResponse.json(
        { error: 'Video has already been refunded' },
        { status: 400 }
      );
    }
    
    if (videoData.status === 'acknowledged') {
      return NextResponse.json(
        { error: 'Video has already been acknowledged and cannot be refunded' },
        { status: 400 }
      );
    }
    
    const now = new Date().toISOString();
    
    // Update video status to refunded
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .update({
        status: 'refunded',
        updated_at: now
      })
      .eq('request_id', videoId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create transaction data (mock, would be real in production)
    const txData = {
      timestamp: now,
      type: 'video_refund',
      status: 'completed'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Video refunded successfully',
      txData,
      video: data
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to refund video';
      
    console.error('Error refunding video:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 