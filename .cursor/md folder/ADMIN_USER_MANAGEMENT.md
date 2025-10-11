# Admin User Management System

## ✅ Complete Implementation

### New Files Created

1. **`app/actions/admin-users.ts`** - Server actions for user management
2. **`app/admin/users/page.tsx`** - User list and management page
3. **`app/admin/users/[id]/page.tsx`** - Individual user detail and edit page
4. **Updated `scripts/03-admin-rls-policies.sql`** - Added user management RLS policies

---

## 🎯 Features Implemented

### Admin Users Page (`/admin/users`)

**Features:**
- ✅ View all users in the system
- ✅ Search by name, email, or skill level
- ✅ Real-time search filtering
- ✅ Separate sections for admins and regular users
- ✅ Stats overview (total users, admins, regular users, free members)
- ✅ Quick actions: Edit, Make Admin, Delete
- ✅ Visual distinction between admins and regular users

**Stats Displayed:**
- Total Users count
- Number of Admins
- Number of Regular Users
- Number of Free Members

**User Cards Show:**
- Name
- Email
- Phone (if provided)
- Skill level badge
- Membership status badge
- Join date
- Admin badge (if admin)

**Actions Available:**
- Edit user details
- Make user an admin
- Remove admin status
- Delete user

### User Detail Page (`/admin/users/[id]`)

**Features:**
- ✅ View complete user profile
- ✅ Edit user information (name, email, phone, skill level)
- ✅ Toggle admin status
- ✅ Delete user
- ✅ View account status (membership, skill level, join date)
- ✅ Activity stats placeholder (for future implementation)

**Edit Capabilities:**
- Name
- Email
- Phone
- Skill Level (Beginner/Intermediate/Advanced/Pro)

**Safety Features:**
- Cannot remove own admin status
- Cannot delete own account
- Confirmation dialogs for destructive actions
- Error handling and user feedback

---

## 🔒 Security & Permissions

### Server Actions (`app/actions/admin-users.ts`)

All actions verify:
1. ✅ User is authenticated
2. ✅ User has `is_admin = true`
3. ✅ Proper error handling
4. ✅ Safety checks (can't delete self, can't remove own admin)

**Actions Available:**
- `getAllUsers(searchQuery?)` - Fetch all users with optional search
- `getUserById(userId)` - Fetch single user with stats
- `updateUser(userId, updates)` - Update user information
- `toggleAdminStatus(userId, isAdmin)` - Grant/revoke admin access
- `deleteUser(userId)` - Delete user account

### RLS Policies (Database Level)

```sql
-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
  );

-- Admins can update users
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
  );

-- Admins can delete users (except themselves)
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() 
      AND u.is_admin = true
    )
    AND id != auth.uid()
  );
```

---

## 🚀 How to Use

### Making Someone an Admin

**Option 1: Via UI (Recommended)**
1. Go to `/admin/users`
2. Find the user in the list
3. Click "Make Admin" button
4. Confirm the action
5. User now has admin access

**Option 2: Via Database**
```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'user@example.com';
```

### Editing User Information

1. Go to `/admin/users`
2. Click "Edit" on any user
3. Update their information:
   - Name
   - Email
   - Phone
   - Skill Level
4. Click "Save Changes"
5. User information is updated

### Removing Admin Access

1. Go to `/admin/users`
2. Find admin in the "Administrators" section
3. Click "Remove Admin"
4. Confirm the action
5. User becomes regular user

### Deleting a User

1. Go to `/admin/users`
2. Click trash icon on user
3. Confirm deletion
4. User and all their data is removed

**Note:** Cannot delete your own account for safety.

---

## 📊 Navigation Structure

```
/admin                  → Dashboard (Events)
/admin/users            → User Management (List)
/admin/users/[id]       → User Detail (Edit)
/admin/events/[id]      → Event Management
```

**Navigation Added:**
- Admin dashboard now has "Users" link
- Users page has "Back to Admin" link
- User detail page has "Back to Users" link

---

## 🧪 Testing Checklist

### Admin Users Page
- [ ] Can access `/admin/users` as admin
- [ ] Cannot access as regular user (redirected)
- [ ] See list of all users
- [ ] Stats show correct counts
- [ ] Search works (name, email, skill)
- [ ] Admins section shows admin users
- [ ] Regular users section shows non-admins
- [ ] Can click "Edit" to go to detail page
- [ ] Can click "Make Admin" to grant access
- [ ] Can click "Remove Admin" to revoke access
- [ ] Can delete users
- [ ] Confirmations work

### User Detail Page
- [ ] Can access `/admin/users/[id]` as admin
- [ ] Shows user information correctly
- [ ] Can edit name
- [ ] Can edit email
- [ ] Can edit phone
- [ ] Can edit skill level
- [ ] Save button works
- [ ] Toggle admin button works
- [ ] Delete button works
- [ ] Cannot delete own account
- [ ] Cannot remove own admin status

### Security
- [ ] Regular users cannot access admin pages
- [ ] Middleware redirects non-admins
- [ ] Server actions verify admin status
- [ ] RLS policies prevent unauthorized access
- [ ] Cannot perform dangerous actions on self

---

## 🎯 What This Enables

### Before:
- ❌ Had to manually update database to make admins
- ❌ No way to view all users
- ❌ No way to edit user information
- ❌ No user management interface

### After:
- ✅ Admins can grant/revoke admin access via UI
- ✅ Can view all users with search
- ✅ Can edit any user's information
- ✅ Can delete users if needed
- ✅ Professional admin interface
- ✅ Proper security and permissions

---

## 🔧 Setup Required

### Run RLS Policies

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Run the complete script
scripts/03-admin-rls-policies.sql
```

This adds policies for:
- ✅ Events (create, update, delete)
- ✅ Court assignments (manage)
- ✅ Queue entries (remove)
- ✅ Users (view all, update, delete)

### Make Your First Admin

If you're not already an admin, run this in Supabase:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

After that, you can use the UI to make other users admins!

---

## 📱 User Interface

### Admin Users List View
```
┌─────────────────────────────────────────────┐
│ User Management                             │
│ Manage users and admin permissions          │
│                                              │
│ [Search: ___________________________]       │
│                                              │
│ Administrators (2)                           │
│ ┌─────────────────────────────────────────┐ │
│ │ 🛡️ John Doe          [Admin] [Advanced] │ │
│ │    john@example.com                     │ │
│ │    [Edit] [Remove Admin]                │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Regular Users (15)                           │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Jane Smith     [Intermediate]        │ │
│ │    jane@example.com                     │ │
│ │    [Edit] [Make Admin] [🗑️]            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### User Detail View
```
┌─────────────────────────────────────────────┐
│ Jane Smith                    [Make Admin]  │
│ jane@example.com              [Delete User] │
│                                              │
│ User Information                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Name:  [Jane Smith___________________]  │ │
│ │ Email: [jane@example.com_____________]  │ │
│ │ Phone: [(555) 123-4567_______________]  │ │
│ │ Skill: [Intermediate ▼]                 │ │
│ │                                          │ │
│ │ [💾 Save Changes]                       │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Account Status                               │
│ Membership: Free                             │
│ Skill Level: Intermediate                    │
│ Member Since: October 9, 2025                │
└─────────────────────────────────────────────┘
```

---

## ✅ Summary

**Created:**
- ✅ Complete admin user management system
- ✅ User list with search
- ✅ User detail/edit page
- ✅ Toggle admin status
- ✅ Delete users
- ✅ Server actions with security
- ✅ RLS policies
- ✅ Navigation links

**Security:**
- ✅ Admin-only access
- ✅ Cannot delete self
- ✅ Cannot remove own admin
- ✅ Confirmation dialogs
- ✅ Error handling

**Ready to use!** Just need to run the RLS policies SQL script.

---

## 🚀 Next Steps

1. **Run SQL script:** `scripts/03-admin-rls-policies.sql` in Supabase
2. **Test the pages:**
   - Go to `/admin/users`
   - Try searching for users
   - Try making someone an admin
   - Try editing a user
3. **Then move to Stripe integration** for membership system

**Admin user management is now complete!** 🎉

