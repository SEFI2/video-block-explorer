import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/db/supabase';
import { CreateVideoRequestParams } from '@/types/video';
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


export async function GET(
    request: Request  ) {
        console.log('API: Fetching videos');
    
    // Get Supabase admin client for this request
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection failed. Check your environment variables.' },
        { status: 500 }
      );
    }
  
    try {
      
      // Get videos for this user with full join of transaction reports
      const { data, error } = await supabaseAdmin
        .from('video_requests')
        .select(`
          *
        `).
        limit(100)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
  
      console.log(`API: Found ${data.length} videos`);
    
      
      return NextResponse.json({
        success: true,
        videos: data
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch user videos';
        
      console.error('Error fetching user videos:', error);
      return NextResponse.json(
        { error: errorMessage },
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