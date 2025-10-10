# Admin Access Fix Guide

## 🚨 Problem
"Unauthorized - Admin access required" even though `is_admin = true` in database.

## 🔍 Root Cause
The `id` in `public.users` table must match the `id` in `auth.users` table. When you set `is_admin = true`, you need to make sure you're updating the correct user record.

---

## ✅ Solution

### Step 1: Find Your Auth User ID

Run this in Supabase SQL Editor:

```sql
-- Find your user ID from auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

Copy the `id` (it's a UUID like `a1b2c3d4-...`)

### Step 2: Check Your Profile in public.users

```sql
-- Check if you have a profile with the same ID
SELECT id, email, name, is_admin 
FROM public.users 
WHERE email = 'your-email@example.com';
```

### Step 3: Update or Create Your Admin Profile

**If the IDs match:**
```sql
-- Just update is_admin
UPDATE public.users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

**If the IDs DON'T match or profile doesn't exist:**
```sql
-- Delete the wrong profile (if exists)
DELETE FROM public.users WHERE email = 'your-email@example.com';

-- Create new profile with correct ID from auth.users
INSERT INTO public.users (id, email, name, phone, skill_level, is_admin)
VALUES (
  'YOUR-AUTH-USER-ID-HERE',  -- Use the ID from auth.users
  'your-email@example.com',
  'Your Name',
  '',  -- Phone (optional)
  'intermediate',
  true  -- Make admin
);
```

### Step 4: Verify It Worked

```sql
-- This should return your user with is_admin = true
SELECT u.id, u.email, u.name, u.is_admin, au.id as auth_id
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'your-email@example.com';
```

The `id` and `auth_id` columns should match!

---

## 🔍 Why This Happens

When you sign up:
1. Supabase Auth creates user in `auth.users` with a UUID
2. Our app creates profile in `public.users` with the SAME UUID
3. The `auth.uid()` function returns the auth user's ID
4. RLS policies check if `auth.uid()` matches `users.id`

If the IDs don't match, RLS policies fail!

---

## 🧪 Quick Test

After fixing, run this in SQL Editor:

```sql
-- This should return your user info
SELECT 
  auth.uid() as current_auth_id,
  u.id as user_profile_id,
  u.email,
  u.is_admin
FROM public.users u
WHERE u.id = auth.uid();
```

If this returns a row with `is_admin = true`, you're good!

---

## 🚀 Alternative: Use Your Current Logged-in Session

If you're already logged in to the app:

1. Open browser console (F12)
2. Run this:
```javascript
const supabase = createClient();
const { data } = await supabase.auth.getUser();
console.log('My Auth ID:', data.user.id);
```

3. Copy that ID
4. Run this in Supabase SQL Editor:
```sql
UPDATE public.users 
SET is_admin = true 
WHERE id = 'PASTE-YOUR-AUTH-ID-HERE';
```

---

## 📝 Common Scenarios

### Scenario 1: Profile exists but wrong ID
**Symptoms:** Profile in database but can't access admin features
**Fix:** Delete profile, recreate with correct auth ID

### Scenario 2: No profile exists
**Symptoms:** Can log in but no profile in public.users
**Fix:** Log in once (profile should be created automatically by auth-context)

### Scenario 3: Profile exists with correct ID but is_admin = false
**Symptoms:** Everything works except admin access
**Fix:** Just update `is_admin = true`

---

## ✅ Recommended Fix (Step by Step)

1. **Log in to your app** at `http://localhost:3001`

2. **Open browser console** (F12)

3. **Get your auth ID:**
```javascript
const supabase = createClient();
const { data } = await supabase.auth.getUser();
console.log('Auth ID:', data.user.id);
console.log('Email:', data.user.email);
```

4. **Go to Supabase Dashboard → SQL Editor**

5. **Run this (replace with your ID):**
```sql
-- Update your profile to be admin
UPDATE public.users 
SET is_admin = true 
WHERE id = 'YOUR-AUTH-ID-FROM-CONSOLE';

-- Verify it worked
SELECT id, email, name, is_admin 
FROM public.users 
WHERE id = 'YOUR-AUTH-ID-FROM-CONSOLE';
```

6. **Refresh the page** - you should now have admin access!

---

## 🎯 After This Works

Once you can access `/admin/users`, you can:
- ✅ Make other users admins via the UI
- ✅ No more manual database updates needed
- ✅ Professional admin management interface

**Try the fix and let me know if you still get the error!** 🚀

