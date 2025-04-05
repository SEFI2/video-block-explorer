import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/db/supabase';
import { CreateVideoRequestParams } from '@/types/video';

export async function GET(request: NextRequest) {
  // Get user address from URL params
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('userAddress');
  
  if (!userAddress) {
    return NextResponse.json(
      { error: 'User address is required' },
      { status: 400 }
    );
  }
  
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database client not available' },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .select('*')
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return NextResponse.json({ videos: data });
  } catch (error) {
    console.error('Error fetching video requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database client not available' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json() as CreateVideoRequestParams;
    const { prompt, duration, deposit, user_address, tx_hash } = body;
    
    // Validate input
    if (!prompt || !duration || !deposit || !user_address || !tx_hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a unique request ID
    const request_id = uuidv4();
    const now = new Date().toISOString();
    
    // Save to database
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .insert({
        request_id,
        user_address,
        prompt,
        duration,
        deposit,
        status: 'pending',
        request_timestamp: now,
        tx_hash
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Successfully created video request
    return NextResponse.json({ success: true, video: data });
  } catch (error) {
    console.error('Error creating video request:', error);
    return NextResponse.json(
      { error: 'Failed to create video request' },
      { status: 500 }
    );
  }
} 