-- Add missing admin INSERT policy for queue_entries
-- This allows admins to add users to queue (needed for test mode)
CREATE POLICY "Admins can insert queue entries" ON queue_entries FOR INSERT
WITH
  CHECK (
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
  cmd
FROM
  pg_policies
WHERE
  tablename = 'queue_entries'
ORDER BY
  policyname;
