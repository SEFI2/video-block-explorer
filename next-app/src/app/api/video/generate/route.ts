import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Create a direct Supabase client instance for this API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Define types
interface ScriptScene {
  description: string;
  duration: string;
}

interface ScriptData {
  script: string;
  scenes: ScriptScene[];
}

interface RequestBody {
  prompt: string;
  duration: string;
  address?: string;
}

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

// Function to call LLM API to generate video script
async function generateVideoScript(prompt: string, duration: string): Promise<ScriptData> {
  try {
    // This is a placeholder - implement actual LLM API call
    // For example, using OpenAI's API or another LLM service
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock video script for now
    return {
      script: `Generated script based on prompt: "${prompt}" with duration: ${duration}.`,
      scenes: [
        { description: "Opening scene introducing the topic", duration: "10s" },
        { description: "Main content covering key points", duration: "30s" },
        { description: "Conclusion and call to action", duration: "10s" }
      ]
    };
  } catch (error) {
    console.error('Error generating video script with LLM:', error);
    throw new Error('Failed to generate video script');
  }
}

export async function POST(request: NextRequest) {
  // Get Supabase admin client for this request
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Database connection failed. Check your environment variables.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json() as RequestBody;
    const { prompt, duration, address } = body;
    
    // Validate input
    if (!prompt || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate video script using LLM
    let scriptData: ScriptData;
    try {
      scriptData = await generateVideoScript(prompt, duration);
    } catch (scriptError) {
      const errorMessage = scriptError instanceof Error 
        ? scriptError.message 
        : String(scriptError);
        
      return NextResponse.json(
        { error: `Script generation failed: ${errorMessage}` },
        { status: 500 }
      );
    }
    
    // Create a unique request ID
    const videoId = uuidv4();
    const now = new Date().toISOString();
    
    // Save to database
    try {
      const { error } = await supabaseAdmin
        .from('video_requests')
        .insert({
          request_id: videoId,
          user_address: address || 'anonymous',
          prompt,
          duration,
          status: 'generating',
          request_timestamp: now,
          generated_text: scriptData.script
        });
      
      if (error && error.details) {
        console.error('Database insert error:', error.details);
        throw error;
      }
      
      // Return success response
      return NextResponse.json({ 
        success: true, 
        videoId,
        message: 'Video generation request received and being processed'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      const errorMessage = dbError instanceof Error 
        ? dbError.message 
        : String(dbError);
        
      return NextResponse.json(
        { error: `Database error: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    // General error handling
    console.error('Error processing video generation request:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
      
    return NextResponse.json(
      { error: `Failed to process video generation request: ${errorMessage}` },
      { status: 500 }
    );
  }
} 