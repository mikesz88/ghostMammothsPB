-- Add missing RLS policy for admins to update queue entries
-- This allows admins to change queue entry status (e.g., from "waiting" to "playing")
-- Run this in Supabase SQL Editor
-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can update queue entries" ON queue_entries;

-- Allow admins to update queue entries
CREATE POLICY "Admins can update queue entries" ON queue_entries FOR
UPDATE USING (
  EXISTS (
    SELECT
      1
    FROM
      users
    WHERE
      users.id = auth.uid ()
      AND users.is_admin = true
  )
);

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM
  pg_policies
WHERE
  tablename = 'queue_entries'
  AND policyname = 'Admins can update queue entries';
