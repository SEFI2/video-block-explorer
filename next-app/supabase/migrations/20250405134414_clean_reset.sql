-- Drop existing table and all related objects
DROP TABLE IF EXISTS video_requests CASCADE;

-- Drop function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Recreate video_requests table with the desired schema (without transaction_hash)
CREATE TABLE IF NOT EXISTS video_requests (
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  user_address TEXT NOT NULL,
  prompt TEXT NOT NULL,
  duration TEXT NOT NULL,
  report_address TEXT NOT NULL,
  intro_text TEXT NOT NULL,
  transaction_reports JSONB,
  outro_text TEXT NOT NULL,
  status TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  network_name TEXT NOT NULL,
  balance TEXT NOT NULL,
  transaction_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_requests_user_address ON video_requests(user_address);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_video_requests_status ON video_requests(status);

-- Enable row level security
ALTER TABLE video_requests ENABLE ROW LEVEL SECURITY;

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
