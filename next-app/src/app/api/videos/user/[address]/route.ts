import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VideoStatus } from '../../../../../types';

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
  { params }: { params: { address: string } }
) {
  const { address } = params;
  console.log('API: Fetching videos for address:', address);
  
  // Get Supabase admin client for this request
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database connection failed. Check your environment variables.' },
      { status: 500 }
    );
  }

  try {
    // Normalize the address to lowercase
    const normalizedAddress = address.toLowerCase();
    
    // Get videos for this user with full join of transaction reports
    const { data, error } = await supabaseAdmin
      .from('video_requests')
      .select(`
        *
      `)
      .eq('user_address', normalizedAddress)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }

    console.log(`API: Found ${data.length} videos for address ${normalizedAddress}`);
    

    
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