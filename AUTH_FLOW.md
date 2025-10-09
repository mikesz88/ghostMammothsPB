# Authentication Flow Documentation

This document explains how user authentication and profile creation works in the pickleball app.

## Overview

The app uses Supabase Auth with a two-table approach:
1. **`auth.users`** - Managed by Supabase Auth (authentication)
2. **`public.users`** - Your custom user profiles (application data)

## Signup Flow

### With Email Confirmation Enabled (Default)

1. **User submits signup form**
   - Email, password, name, skill level, phone

2. **Supabase creates auth user**
   - User is created in `auth.users`
   - Email confirmation is required
   - User metadata is stored (name, skill_level, phone)
   - **Any session is immediately terminated** to prevent premature access

3. **User sees success message**
   - "Check Your Email!" message displayed
   - User is NOT logged in
   - Directed to check email for confirmation link

4. **User receives confirmation email**
   - Must click link to verify email

5. **User confirms email and logs in**
   - First login after confirmation
   - Session is established
   - Login flow checks if profile exists in `public.users`
   - If missing, creates profile using metadata from `auth.users`

6. **Profile is now complete**
   - User exists in both `auth.users` and `public.users`
   - User can access the app

**Security Note:** Middleware checks email confirmation status on every request. Unconfirmed users are automatically signed out and redirected to login.

### With Email Confirmation Disabled

1. **User submits signup form**
   - Email, password, name, skill level, phone

2. **Supabase creates auth user and session**
   - User is created in `auth.users`
   - Session is immediately established
   - User metadata is stored

3. **Profile is created immediately**
   - Profile is inserted into `public.users`
   - User is logged in automatically

4. **User can access the app**
   - No email confirmation needed

## Login Flow

1. **User submits login credentials**
   - Email and password

2. **Supabase authenticates user**
   - Checks credentials against `auth.users`
   - Creates session if valid

3. **Profile check and creation**
   - App checks if user exists in `public.users`
   - If missing (e.g., email was just confirmed), creates profile
   - Uses metadata from `auth.users` if available
   - Falls back to defaults if metadata missing

4. **User is logged in**
   - Session is active
   - Profile exists in both tables

## Row Level Security (RLS)

The app uses RLS policies to secure data:

### Users Table Policies

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation during signup/login
CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Why This Works

- **During signup (no confirmation)**: User has an active session, so `auth.uid()` returns their ID
- **During login**: User has an active session after authentication
- **RLS check**: `auth.uid() = id` ensures users can only create/modify their own profile

## Error Handling

### Common Scenarios

1. **"Row-level security policy" error**
   - **Cause**: RLS policies not set up or session not established
   - **Solution**: Run the RLS setup SQL commands in Supabase

2. **Profile not created during signup**
   - **Cause**: Email confirmation is enabled, no session yet
   - **Expected**: Profile will be created on first login
   - **Solution**: This is normal behavior

3. **User exists in auth.users but not public.users**
   - **Cause**: Profile creation failed or email not confirmed yet
   - **Solution**: Login flow will create the missing profile

## Configuration Options

### Disable Email Confirmation (Development)

**Supabase Dashboard:**
1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck **"Confirm email"**
3. Click **Save**

**Pros:**
- Faster development/testing
- Immediate user access
- Profile created right away

**Cons:**
- Less secure (no email verification)
- Not recommended for production

### Keep Email Confirmation (Production)

**Pros:**
- Verifies email addresses
- More secure
- Prevents fake accounts

**Cons:**
- Requires email service setup
- Slightly more complex flow
- Profile created on first login (not signup)

## Troubleshooting

### Profile Creation Issues

If profiles aren't being created:

1. **Check RLS policies are set up**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. **Verify user has confirmed email** (if confirmation enabled)
   - Check `auth.users` table for `confirmed_at` timestamp

3. **Check browser console for errors**
   - Look for RLS or authentication errors

4. **Manually create profile** (temporary fix)
   ```sql
   INSERT INTO public.users (id, email, name, skill_level, is_admin)
   VALUES (
     'user-uuid-from-auth-users',
     'user@example.com',
     'User Name',
     'intermediate',
     false
   );
   ```

### Session Issues

If users can't stay logged in:

1. **Check environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Verify middleware is running**
   - Check `middleware.ts` is in root directory
   - Check matcher pattern includes your routes

3. **Clear browser cookies**
   - Sometimes stale sessions cause issues

## Best Practices

### Development
- Disable email confirmation for faster testing
- Use test email addresses
- Keep RLS policies enabled to catch issues early

### Production
- Enable email confirmation
- Set up proper email templates in Supabase
- Monitor failed profile creations
- Have fallback logic for missing profiles
- Use proper error logging

## Code References

- **Auth Context**: `lib/auth-context.tsx`
- **Supabase Client**: `lib/supabase/client.ts`
- **Supabase Server**: `lib/supabase/server.ts`
- **Middleware**: `middleware.ts`
- **Login Page**: `app/login/page.tsx`
- **Signup Page**: `app/signup/page.tsx`

