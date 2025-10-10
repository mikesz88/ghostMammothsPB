-- PERMANENT Admin RLS Solution
-- This fixes the circular reference issue properly

-- Step 1: Create a secure function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Step 2: Re-enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing user policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user profile creation" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Step 4: Create new policies using the function

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to view ALL users (using function - no circular reference!)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_current_user_admin() = true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to update any user
CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (public.is_current_user_admin() = true);

-- Allow user profile creation during signup
CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to delete users (except themselves)
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    public.is_current_user_admin() = true 
    AND id != auth.uid()
  );

-- Step 5: Verify policies were created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 6: Test the function works
SELECT 
  auth.uid() as my_id,
  public.is_current_user_admin() as am_i_admin;

-- Step 7: Test you can see all users (if admin)
SELECT COUNT(*) as total_users FROM public.users;

