-- Admin RLS Policies for Events Management
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can create events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;
DROP POLICY IF EXISTS "Admins can manage court assignments" ON court_assignments;

-- Allow admins to create events
CREATE POLICY "Admins can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Allow admins to update events
CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Allow admins to delete events
CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Allow admins to manage court assignments (create, update, delete)
CREATE POLICY "Admins can manage court assignments" ON court_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Allow admins to force remove users from queue
CREATE POLICY "Admins can remove queue entries" ON queue_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
  );

-- Allow admins to update other users
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
  );

-- Allow admins to delete users
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
    AND id != auth.uid() -- Cannot delete own account
  );

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('events', 'queue_entries', 'court_assignments', 'users')
ORDER BY tablename, policyname;

