import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for use on the browser with user authentication
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server operations (API routes)
export const supabaseAdmin = 
  typeof supabaseServiceRoleKey === 'string'
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null; 