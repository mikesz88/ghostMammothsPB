-- Add queue_entry_ids column to court_assignments to track which queue entries were assigned
-- This fixes the issue where groups with duplicate user_ids get lost when games end

-- Add column to store queue entry IDs that were assigned to this court
ALTER TABLE court_assignments ADD COLUMN IF NOT EXISTS queue_entry_ids JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the field
COMMENT ON COLUMN court_assignments.queue_entry_ids IS 'Array of queue_entry.id values that were assigned to this court. Used to properly reposition queue entries when game ends, especially for groups.';

-- Create GIN index for faster lookups
CREATE INDEX IF NOT EXISTS idx_court_assignments_queue_entry_ids ON court_assignments USING GIN (queue_entry_ids);

