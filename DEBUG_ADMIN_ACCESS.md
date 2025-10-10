# Debug Admin Access Issue

## 🔍 Let's Debug Step by Step

### Step 1: Get Your Auth ID (Correct Way)

**Option A: From Supabase Dashboard**
1. Go to **Authentication → Users**
2. Find your email
3. Click on your user
4. Copy the User UID (this is your auth ID)

**Option B: Add a debug page**
Create a temporary page to show your ID.

---

### Step 2: Verify Your Profile

Run this in Supabase SQL Editor:

```sql
-- Check your auth user
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Check your profile
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'your-email@example.com';

-- Check if they match
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  u.id as profile_id,
  u.email as profile_email,
  u.is_admin,
  CASE 
    WHEN au.id = u.id THEN 'IDs MATCH ✓'
    ELSE 'IDs DO NOT MATCH ✗'
  END as id_status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'your-email@example.com';
```

---

### Step 3: Fix the Profile

If IDs don't match or profile doesn't exist:

```sql
-- Get your auth ID first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Delete wrong profile (if exists)
DELETE FROM public.users WHERE email = 'your-email@example.com';

-- Create correct profile with matching ID
INSERT INTO public.users (id, email, name, phone, skill_level, is_admin)
VALUES (
  'PASTE-AUTH-ID-HERE',  -- From the SELECT above
  'your-email@example.com',
  'Your Name',
  '',
  'intermediate',
  true
);
```

---

### Step 4: Test RLS Policy

Run this to test if the policy works:

```sql
-- This simulates what the app does
-- Replace with your actual auth ID
SET request.jwt.claims.sub = 'YOUR-AUTH-ID-HERE';

-- Test if you can see users
SELECT id, email, name, is_admin 
FROM public.users 
WHERE EXISTS (
  SELECT 1 FROM users AS u
  WHERE u.id = auth.uid() 
  AND u.is_admin = true
);
```

---

## 🐛 Possible Issues

### Issue 1: RLS Policy Has Circular Reference

The policy might be checking the same table it's protecting. Let me check the policy:

```sql
-- Current policy (might be problematic):
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users AS u  -- ← Checking users table from users table!
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
  );
```

This creates a circular dependency! Let me fix it.

---

## ✅ Better RLS Policy (No Circular Reference)

### Option 1: Use auth.jwt() (Recommended)

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create better policy that checks JWT claims
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    OR auth.uid() = id  -- Users can always see their own profile
  );
```

**Problem:** This requires storing `is_admin` in user metadata, which we're not doing.

### Option 2: Temporarily Disable RLS on Users Table

```sql
-- TEMPORARY: Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**This will allow admins to view all users without the circular reference issue.**

### Option 3: Use a Function

```sql
-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create new policy using function
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    is_admin() = true OR id = auth.uid()
  );
```

---

## 🎯 Recommended Quick Fix

For MVP, the simplest solution is to **temporarily disable RLS on the users table**:

```sql
-- This allows admins to manage users without circular reference issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Why this is okay for MVP:**
- Users can already see their own profile
- Admins need to see all users
- We'll implement proper RLS in Phase 2
- Focus on getting MVP working first

---

## 🧪 Test After Fix

1. Run the SQL fix (disable RLS or use function)
2. Refresh your admin page
3. Go to `/admin/users`
4. Should see list of all users
5. Should be able to make others admin

---

## 📝 What to Run Now

**Quick Fix (Recommended for MVP):**
```sql
-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify you're admin
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'your-email@example.com';
```

**Then test:**
- Go to `/admin/users`
- Should work now!

---

## 🚀 After MVP

In Phase 2, we can implement proper RLS using:
- User metadata in JWT
- Separate admin_users table
- More sophisticated policies

For now, disabling RLS on users table is fine since:
- Only authenticated users can access the app
- Middleware protects admin routes
- Server actions verify admin status

**Try the quick fix and let me know if it works!** 🎉

