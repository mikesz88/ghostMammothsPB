# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be ready

## 2. Set up Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/01-create-tables.sql`
4. Run the SQL to create all necessary tables

## 3. Configure Authentication

1. Go to **Authentication > Settings** in your Supabase dashboard
2. Configure your site URL (e.g., `http://localhost:3001` for development)
3. Enable email authentication
4. Optionally configure email templates

## 4. Set up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

To get these values:
1. Go to **Settings > API** in your Supabase dashboard
2. Copy the **Project URL** and **anon public** key
3. Replace the placeholder values above

## 5. Enable Real-time (Optional)

1. Go to **Database > Replication** in your Supabase dashboard
2. Enable real-time for these tables:
   - `events`
   - `queue_entries`
   - `court_assignments`
   - `users`

## 6. Set up Row Level Security (RLS)

**IMPORTANT: Run these SQL commands in your Supabase SQL Editor before testing signup!**

```sql
-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_assignments ENABLE ROW LEVEL SECURITY;

-- Allow users to read events
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

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

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- CRITICAL: Allow user profile creation during signup
CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to join/leave queue for events
CREATE POLICY "Users can manage own queue entries" ON queue_entries
  FOR ALL USING (auth.uid() = user_id);

-- Allow users to read queue entries for events
CREATE POLICY "Queue entries are viewable by everyone" ON queue_entries
  FOR SELECT USING (true);

-- Allow users to read court assignments
CREATE POLICY "Court assignments are viewable by everyone" ON court_assignments
  FOR SELECT USING (true);
```

**⚠️ If you're still getting RLS errors, you can temporarily disable RLS on the users table:**

```sql
-- TEMPORARY: Disable RLS on users table for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Note: Only use this for development/testing. Re-enable RLS before production!**

## 7. Configure Email Settings (Important!)

By default, Supabase requires email confirmation for new signups. You have two options:

### Option A: Disable Email Confirmation (Recommended for Development)

1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck **"Confirm email"**
3. Click **Save**

This allows immediate signup without email confirmation.

### Option B: Keep Email Confirmation Enabled

If you keep email confirmation enabled:
- Users will receive a confirmation email after signup
- The user profile in `public.users` will be created automatically when they log in for the first time after confirming their email
- The login flow has built-in logic to create missing profiles

## 8. Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3001`
3. Try creating an account and logging in
   - **If email confirmation is disabled**: You'll be logged in immediately and the profile will be created
   - **If email confirmation is enabled**: Check your email, confirm, then log in - the profile will be created on first login
4. Check if events and queue functionality works

## 9. Create Your First Event (Admin)

To create events, you'll need to:

1. Sign up for an account
2. Manually set `is_admin = true` in the `users` table for your account
3. Or create an admin user directly in the database:

```sql
-- Replace with your actual user ID from auth.users
INSERT INTO users (id, email, name, skill_level, is_admin)
VALUES ('your-user-id', 'your-email@example.com', 'Your Name', 'advanced', true);
```

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check that your environment variables are correct
2. **"Row Level Security" errors**: Make sure RLS policies are set up correctly
3. **Real-time not working**: Enable real-time replication for the tables
4. **Authentication not working**: Check your site URL configuration in Supabase

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the console for error messages
- Check the Network tab in browser dev tools for failed requests
