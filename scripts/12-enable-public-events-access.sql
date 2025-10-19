-- Enable public access to events table
-- Run this in Supabase SQL Editor
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read active events
CREATE POLICY "Anyone can view active events" ON events FOR
SELECT
  USING (status = 'active');

-- Keep existing admin policies for write operations
-- (These should already exist from previous scripts)
-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM
  pg_policies
WHERE
  tablename = 'events'
ORDER BY
  policyname;
