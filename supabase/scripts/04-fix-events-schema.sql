-- Fix events table schema - Remove separate time column
-- The date column (TIMESTAMP) already contains both date and time

-- Option 1: Make time column nullable (Quick fix)
ALTER TABLE events ALTER COLUMN time DROP NOT NULL;

-- Option 2: Remove time column entirely (Better fix)
-- ALTER TABLE events DROP COLUMN IF EXISTS time;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

