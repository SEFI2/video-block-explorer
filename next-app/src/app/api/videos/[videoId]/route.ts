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

export async function GET(
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
    // Get video details
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .select('*')
      .eq('request_id', videoId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }
      
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      video: data
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch video';
      
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const updateData = {} as Record<string, string | null>;
    
    // Only allow updating specific fields
    const allowedFields = ['status', 'generated_text'];
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .update(updateData)
      .eq('request_id', videoId)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Video request not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ success: true, video: data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to update video request';
      
    console.error('Error updating video request:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 