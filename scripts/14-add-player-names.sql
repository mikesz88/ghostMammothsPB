-- Add player_names column to store group member names as JSON
-- This allows us to store all player names when someone joins as a group
-- Format: [{"name": "John", "skillLevel": "intermediate"}, {"name": "Jane", "skillLevel": "advanced"}]

ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS player_names JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN queue_entries.player_names IS 'Array of player names for groups. Format: [{"name": "string", "skillLevel": "string"}, ...]';

-- Create index for better query performance when filtering by player names
CREATE INDEX IF NOT EXISTS idx_queue_entries_player_names ON queue_entries USING GIN (player_names);

