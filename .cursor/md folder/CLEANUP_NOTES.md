# Cleanup Notes - Duplicate src/app Folder Removed

## What Was Removed

The `/src/app` folder contained duplicate and outdated code that was conflicting with the main `/app` directory. Next.js only uses ONE app directory, and the correct one is `/app` at the root level.

### Files that were in src/app:

1. **`src/app/Membership/page.tsx`**
   - Basic membership page with auth buttons
   - Less complete than what we'll build with Stripe integration
   - Content: Simple member benefits list
   
2. **`src/app/Membership/components/AuthButtons.tsx`**
   - Basic auth form (sign in/sign up toggle)
   - Already superseded by `/app/login` and `/app/signup` pages
   
3. **`src/app/Membership/components/UserProfile.tsx`**
   - Empty/basic user profile component
   
4. **`src/app/Calendar/page.tsx`**
   - Placeholder page with just "Calendar page" text
   - We'll implement this properly with Google Calendar
   
5. **`src/app/About/page.tsx`**
   - Placeholder page
   - We already have `/app/about/page.tsx`
   
6. **`src/app/utils/context/AuthContext.tsx`**
   - Older auth context implementation
   - Already replaced by `/lib/auth-context.tsx` (better implementation)
   
7. **`src/app/utils/supabase.ts`**
   - Basic Supabase client
   - Already replaced by `/lib/supabase/client.ts` and `/lib/supabase/server.ts`
   
8. **`src/app/componets/navbar/navbar.tsx`**
   - Old navbar component
   - Already replaced by better header in layout

## Current Status

After cleanup, the app now has:
- ONE app directory: `/app` (correct location)
- Proper auth context: `/lib/auth-context.tsx`
- Proper Supabase clients: `/lib/supabase/`
- All current pages in `/app/` directory

## What We Kept/Have

All the good stuff is in the main `/app` folder:
- ✅ `/app/login/page.tsx` - Full login page with email confirmation
- ✅ `/app/signup/page.tsx` - Full signup with skill level, phone, etc.
- ✅ `/app/events/` - Events listing and details
- ✅ `/app/admin/` - Admin dashboard and event management
- ✅ `/app/about/page.tsx` - About page (needs content)
- ✅ `/lib/auth-context.tsx` - Complete auth implementation
- ✅ `/lib/supabase/` - Proper SSR-safe Supabase clients

## Membership Page - To Be Built

The old `src/app/Membership` was very basic. We'll build a proper membership page with:
- Stripe integration
- Pricing tiers display
- Checkout flow
- Membership management
- Payment history

This will be created fresh in `/app/membership/` as outlined in the IMPLEMENTATION_PLAN.md.

## Calendar Page - To Be Built

The placeholder calendar page will be replaced with proper Google Calendar integration in `/app/calendar/page.tsx`.

## No Functionality Lost

The `src/app` folder was either:
1. Duplicates of better implementations in `/app`
2. Placeholder pages we'll build properly
3. Older auth code that was already replaced

All actual working features remain in the `/app` directory.

