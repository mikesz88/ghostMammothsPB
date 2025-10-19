<!-- 15ae7fcb-d305-4a9b-9aa9-b28b722236c0 f7b3d938-6cf2-47e8-a085-9f688825c26a -->
# Simplify MVP: Temporary Event Accounts

## Overview

Transform the app to use temporary user accounts tied to specific events. Users join event queues by entering their email (no password/traditional signup), and accounts are automatically deleted when the event ends. Hide non-essential pages while keeping all admin functionality.

## Database Changes

### 1. Add temp account flag to users table

Create migration: `scripts/12-add-temp-account-flag.sql`

```sql
-- Add is_temp flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_temp BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Index for faster temp account lookups
CREATE INDEX IF NOT EXISTS idx_users_temp ON users(is_temp);
CREATE INDEX IF NOT EXISTS idx_users_event ON users(event_id);
```

## Core Functionality Changes

### 2. Update Join Queue Dialog

File: `components/join-queue-dialog.tsx`

Modify to:

- Show simple email input field (no login required)
- Create or find existing temp user account for this event
- Auto-join queue after account creation
- Remove authentication checks

Key changes:

```typescript
// Check if temp account exists for this email + event
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .eq('event_id', eventId)
  .eq('is_temp', true)
  .single();

// If not, create temp account
if (!existingUser) {
  await supabase.from('users').insert({
    email: email,
    name: name || email.split('@')[0],
    is_temp: true,
    event_id: eventId,
    skill_level: 'intermediate' // default
  });
}
```

### 3. Update Queue Actions

File: `app/actions/queue.ts`

Modify `joinQueue()` to:

- Accept email instead of requiring authenticated user
- Create/find temp account if doesn't exist
- Link temp account to event

### 4. Create Temp Account Helper

New file: `lib/temp-accounts.ts`

```typescript
export async function createOrGetTempAccount(
  email: string,
  eventId: string,
  name?: string
) {
  const supabase = createClient();
  
  // Check if temp account exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .eq('event_id', eventId)
    .eq('is_temp', true)
    .single();
    
  if (existing) return existing;
  
  // Create new temp account
  const { data } = await supabase
    .from('users')
    .insert({
      email,
      name: name || email.split('@')[0],
      is_temp: true,
      event_id: eventId,
      skill_level: 'intermediate'
    })
    .select()
    .single();
    
  return data;
}
```

### 5. Update Event Deletion

File: `app/admin/page.tsx` - `handleDeleteEvent()`

File: `app/admin/page.tsx` - `handleEndEvent()`

Add temp account cleanup:

```typescript
// Delete temp accounts for this event
await supabase
  .from('users')
  .delete()
  .eq('event_id', eventId)
  .eq('is_temp', true);
```

## UI/Navigation Changes

### 6. Update Header Navigation

File: `components/ui/header.tsx`

Remove from `DefaultNav`:

- Calendar link (line 103-108)
- About link (line 109-114)
- Shop link (line 115-123)
- Settings dropdown item (line 231-236)

Keep only:

- Events link
- Admin Dashboard (for admins)

### 7. Simplify Homepage

File: `app/page.tsx`

Replace hero section with active events list (similar to `/events` page):

- Show all active events as cards
- Each card has "Join Queue" button that opens email dialog
- Remove "Sign Up" and "Login" buttons
- Keep admin dashboard button for admins only

### 8. Hide/Redirect Protected Pages

Update these pages to redirect to `/events`:

- `app/settings/page.tsx` - Add redirect
- `app/settings/membership/page.tsx` - Add redirect
- `app/settings/notifications/page.tsx` - Add redirect
- `app/membership/page.tsx` - Add redirect
- `app/membership/checkout/page.tsx` - Add redirect
- `app/membership/success/page.tsx` - Add redirect
- `app/membership/cancel/page.tsx` - Add redirect
- `app/calendar/page.tsx` - Add redirect
- `app/about/page.tsx` - Add redirect (if exists)

Add to each:

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/events');
  }, [router]);
  return null;
}
```

Or keep login/signup ONLY for admins with a note:

```typescript
// Add to login/signup pages
<Alert>
  <AlertDescription>
    Admin login only. Regular users can join events directly without an account.
  </AlertDescription>
</Alert>
```

### 9. Update Event Detail Page

File: `app/events/[id]/page.tsx`

Remove authentication requirements:

- Remove membership tier checks (lines 47-50, related logic)
- Remove login requirement for joining queue
- Show email input dialog instead of requiring auth
- Remove payment/membership related UI

### 10. Update Admin Event Management

File: `app/admin/events/[id]/page.tsx`

Ensure "Assign Next Players" sends court assignment emails to temp accounts.

## Email System Updates

### 11. Update Email Notifications

Files: Already implemented, but verify temp accounts receive emails

Ensure notifications work for temp accounts (should already work since we're using user email from database).

## Testing Checklist

After implementation:

1. User visits `/events`
2. Clicks on an event
3. Enters email in "Join Queue" dialog
4. Temp account created, user added to queue
5. User receives queue join email
6. User receives position update emails
7. Admin assigns to court
8. User receives court assignment email
9. Admin ends event
10. Temp accounts for that event are deleted

## Files to Modify

1. `scripts/12-add-temp-account-flag.sql` (new)
2. `lib/temp-accounts.ts` (new)
3. `components/join-queue-dialog.tsx`
4. `app/actions/queue.ts`
5. `app/admin/page.tsx`
6. `components/ui/header.tsx`
7. `app/page.tsx`
8. `app/events/[id]/page.tsx`
9. `app/settings/page.tsx` (add redirect)
10. `app/calendar/page.tsx` (add redirect)
11. `app/membership/page.tsx` (add redirect)
12. `app/login/page.tsx` (add admin-only note)
13. `app/signup/page.tsx` (add admin-only note)

## Admin Functionality (Unchanged)

Keep all existing admin features:

- Admin login/authentication
- Event management (create, edit, delete, end)
- User management
- Queue management
- Court assignments
- Email statistics dashboard
- All admin pages intact

### To-dos

- [ ] Create database migration to add is_temp and event_id columns to users table
- [ ] Create temp account helper functions
- [ ] Update join queue dialog to accept email and create temp accounts
- [ ] Modify queue actions to work with temp accounts
- [ ] Update event deletion to clean up temp accounts
- [ ] Remove Calendar, About, Shop, Settings from header navigation
- [ ] Update homepage to show active events list
- [ ] Add redirects to Settings, Membership, Calendar pages
- [ ] Update event detail page to remove auth requirements
- [ ] Add admin-only note to login/signup pages