-- Create video_requests table
CREATE TABLE IF NOT EXISTS video_requests (
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  user_address TEXT NOT NULL,
  prompt TEXT NOT NULL,
  duration TEXT NOT NULL,
  deposit TEXT NOT NULL,
  status TEXT NOT NULL,
  generated_text TEXT,
  request_timestamp TIMESTAMP NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_requests_user_address ON video_requests(user_address);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_video_requests_status ON video_requests(status);

-- Create RLS policies for security (optional, depends on your Supabase setup)
ALTER TABLE video_requests ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust based on your authentication strategy)
-- CREATE POLICY "Users can view their own videos" 
--   ON video_requests FOR SELECT 
--   USING (auth.uid()::text = user_address);

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