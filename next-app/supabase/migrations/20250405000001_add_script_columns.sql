-- Migration script to add script and script_data columns to video_requests table

-- First, check if the columns already exist
DO $$
BEGIN
    -- Check for script column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'video_requests' AND column_name = 'script'
    ) THEN
        -- Add script column
        ALTER TABLE video_requests ADD COLUMN script TEXT;
    END IF;

    -- Check for script_data column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'video_requests' AND column_name = 'script_data'
    ) THEN
        -- Add script_data column as JSONB for structured data
        ALTER TABLE video_requests ADD COLUMN script_data JSONB;
    END IF;
    
    -- Output completion message
    RAISE NOTICE 'Migration completed successfully!';
END $$; 