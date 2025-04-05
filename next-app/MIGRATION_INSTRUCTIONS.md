# Database Migration Instructions

Since we're unable to automate the migration with the available tools, here are the steps to perform the migration manually through the Supabase Dashboard:

1. Visit [Supabase Dashboard](https://app.supabase.com/)
2. Sign in and select your project
3. Navigate to the SQL Editor (in the sidebar)
4. Create a new query and paste the content of the `reset-migration.sql` file
5. Execute the query

## Alternative: If the query is too large to run at once

If the Supabase SQL Editor doesn't allow you to run the entire script at once, you can run each statement separately in this order:

1. First, drop existing tables:
```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS video_requests CASCADE;
```

2. Create the video_requests table:
```sql
-- Create video_requests table
CREATE TABLE IF NOT EXISTS video_requests (
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  user_address TEXT NOT NULL,
  prompt TEXT NOT NULL,
  duration TEXT NOT NULL,
  report_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  transaction_report JSONB,
  transaction_status TEXT,
  status TEXT NOT NULL,
  request_timestamp TIMESTAMP NOT NULL,
  chain_id INTEGER NOT NULL,
  network_name TEXT NOT NULL,
  balance TEXT NOT NULL,
  transaction_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Create the indexes:
```sql
-- Create index on user_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_requests_user_address ON video_requests(user_address);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_video_requests_status ON video_requests(status);

-- Create index on transaction_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_requests_transaction_hash ON video_requests(transaction_hash);
```

4. Enable Row Level Security:
```sql
-- Create RLS policies for security
ALTER TABLE video_requests ENABLE ROW LEVEL SECURITY;
```

5. Create the updated_at function and trigger:
```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_video_requests_updated_at
BEFORE UPDATE ON video_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Verifying the Migration

After applying all migrations, you can verify the table structure with:

```sql
-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'video_requests'
ORDER BY 
  ordinal_position;
``` 