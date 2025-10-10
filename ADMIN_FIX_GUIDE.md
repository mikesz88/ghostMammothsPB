# Admin Event Creation Fix Guide

## 🚨 Problem
Cannot create events from admin dashboard - likely due to missing RLS policies for admin users.

## ✅ Solution

### Step 1: Run Admin RLS Policies
Go to **Supabase Dashboard → SQL Editor** and run this:

```sql
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

-- Allow admins to manage court assignments
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
```

**OR** run the complete script:
```bash
# In Supabase SQL Editor, run:
scripts/03-admin-rls-policies.sql
```

### Step 2: Make Sure You're an Admin
Check that your user has `is_admin = true`:

```sql
-- Check your admin status
SELECT id, email, name, is_admin 
FROM users 
WHERE email = 'your-email@example.com';

-- If is_admin is false, update it:
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### Step 3: Test Event Creation
1. Go to `/admin`
2. Click "Create Event"
3. Fill in the form
4. Check browser console for any errors
5. Event should be created and appear in the list

---

## 🔍 What I Fixed in the Code

### Admin Dashboard (`app/admin/page.tsx`)
✅ **Replaced mock data with Supabase**
- Fetches events from database on load
- Creates events in database
- Updates events in database
- Deletes events from database
- Ends events (updates status)

✅ **Added comprehensive error handling**
- Try-catch blocks on all operations
- Console logging for debugging
- User-friendly error alerts
- Success confirmations

✅ **Added loading states**
- Shows spinner while fetching data
- Prevents UI flash

---

## 🐛 Debugging Steps

If event creation still fails:

### 1. Check Browser Console
Open DevTools (F12) and look for:
- Red error messages
- The `console.log` statements I added
- Network tab for failed requests

### 2. Check Supabase Logs
Go to **Supabase Dashboard → Logs → Postgres Logs**
- Look for RLS policy violations
- Look for permission errors

### 3. Verify Environment Variables
Check `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 4. Test Database Connection
Try this in browser console on admin page:
```javascript
const supabase = createClient();
const { data, error } = await supabase.from('events').select('*');
console.log('Events:', data, 'Error:', error);
```

### 5. Check Admin Status
In Supabase Dashboard → Table Editor → users table:
- Find your user by email
- Verify `is_admin` column is `true`

---

## 🎯 Expected Behavior After Fix

1. **Admin Dashboard:**
   - Shows all events from database (empty list if no events)
   - "Create Event" button opens dialog
   - Form submission creates event in database
   - New event appears in list immediately
   - Success alert shows

2. **Event Operations:**
   - Edit event updates database
   - End event changes status to "ended"
   - Delete event removes from database
   - All changes reflect immediately

3. **Error Messages:**
   - Clear error messages if something fails
   - Console logs for debugging
   - User-friendly alerts

---

## 📋 Quick Test Checklist

After running the SQL policies:

- [ ] Can access `/admin` page
- [ ] Can see "Create Event" button
- [ ] Can open create event dialog
- [ ] Can fill in event details
- [ ] Can submit form
- [ ] See success alert
- [ ] Event appears in list
- [ ] Can edit the event
- [ ] Can end the event
- [ ] Can delete the event

If ANY of these fail, check the console for the error message and let me know!

---

## 🚀 Next Steps

1. **Run the SQL script** (`scripts/03-admin-rls-policies.sql`)
2. **Verify you're an admin** (check `is_admin` column)
3. **Test event creation**
4. **Check browser console** if it fails
5. **Report the specific error** so I can help debug

The code is ready - we just need the database policies in place!

