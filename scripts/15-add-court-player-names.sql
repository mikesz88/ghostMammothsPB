-- Add player_names column to court_assignments to store actual names for groups
-- This allows us to display different names for group members who share the same user_id
-- Format: ["John Doe", "Jane Smith", "Bob Jones", "Alice Williams"]

ALTER TABLE court_assignments ADD COLUMN IF NOT EXISTS player_names JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN court_assignments.player_names IS 'Array of player names in slot order. Used to display correct names for group members.';

