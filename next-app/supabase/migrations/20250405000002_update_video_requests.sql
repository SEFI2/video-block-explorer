-- Migration script to update video_requests table for API-based approach
-- This removes the deposit and tx_hash requirement from the video_requests table

DO $$
BEGIN
    -- Make deposit column nullable
    ALTER TABLE video_requests ALTER COLUMN deposit DROP NOT NULL;
    
    -- Make tx_hash column nullable
    ALTER TABLE video_requests ALTER COLUMN tx_hash DROP NOT NULL;
    
    -- Add a default value for deposit (empty string)
    ALTER TABLE video_requests ALTER COLUMN deposit SET DEFAULT '';
    
    -- Add a default value for tx_hash (empty string)
    ALTER TABLE video_requests ALTER COLUMN tx_hash SET DEFAULT '';
    
    RAISE NOTICE 'Migration completed successfully!';
END $$; 