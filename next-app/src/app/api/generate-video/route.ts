import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient, PostgrestError } from '@supabase/supabase-js';

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
  walletAddress: string;
  activityType?: string;
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
async function generateVideoScript(prompt: string, duration: string, activityType: string): Promise<ScriptData> {
  try {
    // This is a placeholder - implement actual LLM API call
    // For example, using OpenAI's API or another LLM service
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock video script for now
    return {
      script: `Generated script based on prompt: "${prompt}" with duration: ${duration} for ${activityType} activity.`,
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
    const { prompt, duration, walletAddress, activityType } = body;
    
    // Validate input
    if (!prompt || !duration || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate video script using LLM
    let scriptData: ScriptData;
    try {
      scriptData = await generateVideoScript(prompt, duration, activityType || 'default');
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
    
    // Create mock transaction data (this would be real data in production)
    const txData = {
      timestamp: now,
      type: 'video_generation',
      status: 'processing'
    };
    
    // Save to database
    try {
      const { error } = await supabaseAdmin
        .from('video_requests')
        .insert({
          request_id: videoId,
          user_address: walletAddress,
          prompt,
          duration,
          deposit: '0', // No deposit required in this approach
          status: 'generating',
          request_timestamp: now,
          tx_hash: '', // No blockchain tx hash in this approach
          generated_text: scriptData.script
        });
      
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      // Return success response
      return NextResponse.json({ 
        success: true, 
        videoId,
        txData,
        message: 'Video generation request received and being processed'
      });
    } catch (dbError) {
      // Properly format database errors
      let errorMessage = 'Database error';
      
      if (dbError instanceof PostgrestError) {
        errorMessage += `: ${dbError.message}`;
        if (dbError.details) {
          errorMessage += ` - ${dbError.details}`;
        }
      } else if (dbError instanceof Error) {
        errorMessage += `: ${dbError.message}`;
      } else if (typeof dbError === 'object' && dbError !== null) {
        // If no useful properties found, try to stringify the entire object
        try {
          errorMessage += `: ${JSON.stringify(dbError)}`;
        } catch (err) {
          errorMessage += `: (Cannot display detailed error information) ${err}`;
        }
      } else {
        errorMessage += `: ${String(dbError)}`;
      }
      
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    // General error handling
    let errorMessage = 'Failed to process video generation request';
    
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    } else if (error && typeof error === 'object') {
      try {
        errorMessage += `: ${JSON.stringify(error)}`;
      } catch (err) {
        // If error can't be stringified
        errorMessage += ` (Cannot stringify error details: ${err})`;
      }
    } else if (error) {
      errorMessage += `: ${String(error)}`;
    }
    
    console.error('Error processing video generation request:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 