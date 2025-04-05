import { createClient } from '@supabase/supabase-js';

// Check if the required environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create admin client with service role key for server-side operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Create client with anon key for client-side operations
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to get the appropriate client based on context
export const getSupabase = () => {
  // For server-side operations, use the admin client
  if (typeof window === 'undefined') {
    return supabaseAdmin;
  }
  // For client-side operations, use the anon client
  return supabaseClient;
}; 