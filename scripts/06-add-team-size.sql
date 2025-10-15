-- Add team_size column to events table
ALTER TABLE events
ADD COLUMN team_size INTEGER NOT NULL DEFAULT 2;

COMMENT ON COLUMN events.team_size IS '1=solo(1v1), 2=doubles(2v2), 3=triplets(3v3), 4=quads(4v4)';

-- Add additional player columns to court_assignments for 4v4 support
ALTER TABLE court_assignments
ADD COLUMN player5_id UUID REFERENCES users (id);

ALTER TABLE court_assignments
ADD COLUMN player6_id UUID REFERENCES users (id);

ALTER TABLE court_assignments
ADD COLUMN player7_id UUID REFERENCES users (id);

ALTER TABLE court_assignments
ADD COLUMN player8_id UUID REFERENCES users (id);

-- Update existing events to have team_size = 2 (doubles)
UPDATE events
SET
  team_size = 2
WHERE
  team_size IS NULL;
