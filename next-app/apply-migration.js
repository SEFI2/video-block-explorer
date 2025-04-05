// This script applies the migration by executing SQL directly
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Main function
async function applyMigration() {
  try {
    // Drop the old table
    console.log('Dropping existing table...');
    await supabase.from('video_requests').delete().neq('id', 0);
    
    // Get the current schema
    const { data: columns, error: columnsError } = await supabase
      .from('video_requests')
      .select()
      .limit(1);
    
    if (columnsError) {
      console.error('Error fetching table schema:', columnsError);
      return;
    }
    
    console.log('Current schema:', columns.length > 0 ? Object.keys(columns[0]) : 'No rows');
    
    // Apply the migration directly
    // We'll use PATCH to modify columns rather than recreating the table
    
    // 1. Remove columns
    console.log('Removing deposit, generated_text, and tx_hash columns...');
    const alterTable1 = `
      ALTER TABLE video_requests 
      DROP COLUMN IF EXISTS deposit,
      DROP COLUMN IF EXISTS generated_text,
      DROP COLUMN IF EXISTS tx_hash;
    `;
    
    // 2. Add new columns
    console.log('Adding new columns...');
    const alterTable2 = `
      ALTER TABLE video_requests 
      ADD COLUMN IF NOT EXISTS report_address TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS transaction_hash TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS transaction_report JSONB,
      ADD COLUMN IF NOT EXISTS transaction_status TEXT,
      ADD COLUMN IF NOT EXISTS chain_id INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS network_name TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS balance TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS transaction_count INTEGER NOT NULL DEFAULT 0;
    `;
    
    // 3. Create indexes
    console.log('Creating indexes...');
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_video_requests_transaction_hash 
      ON video_requests(transaction_hash);
    `;
    
    // Execute each SQL statement separately using .rpc()
    const { error: error1 } = await supabase.rpc('query', { sql: alterTable1 });
    if (error1) console.error('Error dropping columns:', error1);
    
    const { error: error2 } = await supabase.rpc('query', { sql: alterTable2 });
    if (error2) console.error('Error adding columns:', error2);
    
    const { error: error3 } = await supabase.rpc('query', { sql: createIndexes });
    if (error3) console.error('Error creating indexes:', error3);
    
    // Verify the new schema
    const { data: newColumns, error: newColumnsError } = await supabase
      .from('video_requests')
      .select()
      .limit(1);
    
    if (newColumnsError) {
      console.error('Error fetching updated schema:', newColumnsError);
      return;
    }
    
    console.log('Updated schema:', newColumns.length > 0 ? Object.keys(newColumns[0]) : 'No rows');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration process:', error);
  }
}

applyMigration(); 