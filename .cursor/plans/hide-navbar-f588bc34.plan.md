<!-- f588bc34-d9bf-412b-801f-9a5ab4ae8bdb 5bc03f94-8fcc-41c6-9af1-57b7fb36e27e -->
# Hide Non-Essential Navigation for Regular Users

## Changes for Regular Users

### 1. Update Header Navigation

**File: `components/ui/header.tsx`**

In the `DefaultNav` component (lines 94-124), remove these links:

- Calendar (lines 103-108)
- About (lines 109-114)  
- Shop (lines 115-122)

Keep only:

- Events link (lines 97-102)

Also update the mobile navigation in the `UserMenu` component to match - remove Calendar, About, and Shop from the mobile dropdown menu (around lines 186-205).

### 2. Simplify Settings Page

**File: `app/settings/page.tsx`**

Remove these sections from the Settings page (lines 254-308):

- "Settings & Preferences" heading and section
- "Membership & Billing" card/link (lines 261-282)
- "Notifications" card/link (lines 285-307)

Keep only:

- "Account Information" card (lines 118-192)
- "Membership Status" card if user has membership (lines 194-252)
- Modified "Quick Actions" section - remove "Upgrade Membership" button, keep only "Browse Events" and admin dashboard link

### 3. Add Redirects for Hidden Pages

Create simple redirect components for:

- `app/settings/membership/page.tsx` - redirect to `/settings`
- `app/settings/notifications/page.tsx` - redirect to `/settings`
- `app/calendar/page.tsx` - redirect to `/events`
- `app/about/page.tsx` - redirect to `/events`

Use this pattern:

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/events'); // or '/settings' for settings subpages
  }, [router]);
  return null;
}
```

## Admin Functionality (Unchanged)

- Admin navigation (AdminNav) remains unchanged with Events, Dashboard, and Users links
- All admin pages and functionality stay intact
- Admin Settings access remains full-featured

## Files to Modify

1. `components/ui/header.tsx` - Remove Calendar, About, Shop from DefaultNav and mobile menu
2. `app/settings/page.tsx` - Show only Account Information section
3. `app/settings/membership/page.tsx` - Add redirect to `/settings`
4. `app/settings/notifications/page.tsx` - Add redirect to `/settings`
5. `app/calendar/page.tsx` - Add redirect to `/events`
6. `app/about/page.tsx` - Add redirect to `/events`