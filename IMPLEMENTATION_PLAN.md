# Implementation Plan - Ghost Mammoths PB App

## Current Status vs Requirements

### ✅ Already Implemented

#### User-Side Features
- [x] Join event
- [x] Enter skill level (during signup)
- [x] Join queue (solo only currently)
- [x] Leave queue
- [x] See who's up next (queue list)
- [x] Real-time updates (Supabase real-time hooks created)
- [x] Push/web alerts framework (notification system in place)

#### Admin-Side Features
- [x] Create events
- [x] Edit events (UI exists)
- [x] Manage court count
- [x] Rotation logic (2-stay-4-off, winners-stay, rotate-all)
- [x] Auto-assign next match-ups (QueueManager class)
- [x] Queue management UI

#### Technical Infrastructure
- [x] Authentication (email confirmation flow)
- [x] Database schema (events, users, queue_entries, court_assignments)
- [x] Row Level Security (RLS) policies
- [x] Real-time subscriptions
- [x] Server actions for data mutations
- [x] Middleware for protected routes

### 🚧 Partially Implemented

- [ ] Group queue (duo/triple/quad) - Schema supports it, UI needs implementation
- [ ] Force-remove users - Backend ready, UI needs implementation
- [ ] End event/session - Needs implementation
- [ ] Text alerts - Framework exists, SMS integration needed
- [ ] Admin user management page - Needs creation

### ❌ Not Implemented

#### Core Missing Features
- [ ] Membership system (free vs paid)
- [ ] Payment processing
- [ ] Monthly auto-billing for paid members
- [ ] Free event entry for paid members
- [ ] Google Calendar integration
- [ ] Shopify e-commerce integration
- [ ] About page (basic structure exists, needs content)
- [ ] Admin user management interface

---

## Implementation Phases

### Phase 1: Complete Core Queue & Admin Features (Priority: HIGH)

#### 1.1 Group Queue System
**Files to modify:**
- `components/join-queue-dialog.tsx` - Add group size selection
- `app/actions/queue.ts` - Update joinQueue to handle groups
- `app/events/[id]/page.tsx` - Display group indicators

**Tasks:**
- [ ] Add UI for selecting group size (solo, duo, triple, quad)
- [ ] Update queue display to show grouped players
- [ ] Implement group matching logic in QueueManager
- [ ] Add group_id generation when joining as group

#### 1.2 Admin User Management Page
**New files:**
- `app/admin/users/page.tsx` - User list and management
- `app/admin/users/[id]/page.tsx` - Individual user details
- `app/actions/admin-users.ts` - Server actions for user management

**Features:**
- [ ] View all users (with search/filter)
- [ ] View user details (events attended, queue history)
- [ ] Edit user info (name, skill level, phone)
- [ ] Toggle admin status
- [ ] Delete/deactivate users
- [ ] View membership status (once implemented)

#### 1.3 Force Remove Users from Queue
**Files to modify:**
- `app/admin/events/[id]/page.tsx` - Add remove button to queue entries
- `app/actions/queue.ts` - Add removeUserFromQueue action

**Tasks:**
- [ ] Add "Remove" button next to each queue entry (admin only)
- [ ] Create server action to remove user from queue
- [ ] Add confirmation dialog
- [ ] Log admin action

#### 1.4 End Event/Session
**Files to modify:**
- `app/admin/events/[id]/page.tsx` - Add "End Event" button
- `app/actions/events.ts` - Add endEvent action

**Tasks:**
- [ ] Add "End Event" button with confirmation
- [ ] Update event status to "ended"
- [ ] Clear all queue entries
- [ ] Clear all court assignments
- [ ] Show event summary (total players, games played)
- [ ] Archive event data (optional - for history)

---

### Phase 2: Membership System (Priority: HIGH)

#### 2.1 Database Schema Updates
**New tables needed:**

```sql
-- Membership tiers
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'free', 'monthly'
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL, -- 'monthly', 'one-time'
  features JSONB, -- Store feature flags
  created_at TIMESTAMP DEFAULT NOW()
);

-- User memberships
CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES membership_tiers(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event pricing (for non-members)
ALTER TABLE events ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE events ADD COLUMN free_for_members BOOLEAN DEFAULT TRUE;

-- Payment history
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_type TEXT NOT NULL, -- 'membership', 'event', 'product'
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Files to create:**
- `scripts/02-membership-tables.sql`
- `lib/types-membership.ts`

#### 2.2 Stripe Integration
**New files:**
- `lib/stripe/client.ts` - Stripe client setup
- `lib/stripe/server.ts` - Server-side Stripe operations
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `app/actions/membership.ts` - Membership management actions

**Environment variables needed:**
```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Tasks:**
- [ ] Set up Stripe account
- [ ] Install Stripe SDK (`npm install stripe @stripe/stripe-js`)
- [ ] Create Stripe products for membership tiers
- [ ] Implement checkout flow
- [ ] Set up webhook handler for subscription events
- [ ] Create membership management UI

#### 2.3 Membership Pages
**New files:**
- `app/membership/page.tsx` - Membership plans and pricing
- `app/membership/checkout/page.tsx` - Checkout flow
- `app/membership/success/page.tsx` - Success page
- `app/membership/cancel/page.tsx` - Cancellation page
- `app/settings/membership/page.tsx` - Manage membership

**Features:**
- [ ] Display membership tiers (Free vs Monthly)
- [ ] Stripe checkout integration
- [ ] Membership status display
- [ ] Cancel/upgrade membership
- [ ] Payment history

#### 2.4 Event Access Control
**Files to modify:**
- `app/events/[id]/page.tsx` - Check membership before allowing join
- `components/join-queue-dialog.tsx` - Show payment required for non-members
- `app/actions/queue.ts` - Validate membership status

**Logic:**
- Free users: Can join events marked as free, or pay per event
- Paid members: Can join all events for free
- Show "Upgrade to join" button for free users on paid events

---

### Phase 3: Additional Features (Priority: MEDIUM)

#### 3.1 Google Calendar Integration
**New files:**
- `app/calendar/page.tsx` - Calendar view of events
- `lib/google-calendar.ts` - Google Calendar API integration
- `app/api/calendar/sync/route.ts` - Calendar sync endpoint

**Options:**
1. **Embed Google Calendar** (Easiest)
   - Create a public Google Calendar
   - Embed iframe in calendar page
   - Admins add events via Google Calendar UI

2. **Two-way sync** (More complex)
   - Use Google Calendar API
   - Sync events from database to Google Calendar
   - Allow users to add to their personal calendar

**Recommended: Option 1 for MVP**

#### 3.2 Shopify Integration
**New files:**
- `app/shop/page.tsx` - Shop page with Shopify Buy Button
- Or redirect to external Shopify store

**Options:**
1. **Shopify Buy Button** (Easiest)
   - Embed Shopify products using Buy Button
   - Users checkout on Shopify

2. **Shopify Storefront API** (More integrated)
   - Fetch products via API
   - Display in custom UI
   - Checkout via Shopify

**Recommended: Option 1 for MVP**

#### 3.3 About Page Enhancement
**File to modify:**
- `app/about/page.tsx`

**Content needed:**
- Organization history
- Mission statement
- Team members
- Contact information
- Photos/videos
- Testimonials

#### 3.4 SMS Notifications
**New files:**
- `lib/twilio.ts` - Twilio integration
- `app/actions/notifications.ts` - Notification sending logic

**Tasks:**
- [ ] Set up Twilio account
- [ ] Install Twilio SDK (`npm install twilio`)
- [ ] Implement SMS sending
- [ ] Add phone number verification
- [ ] Add SMS notification preferences to user settings
- [ ] Send SMS when user is up next

---

### Phase 4: Polish & Production (Priority: MEDIUM)

#### 4.1 Admin Dashboard Enhancements
**Files to modify:**
- `app/admin/page.tsx` - Add analytics and stats

**Features:**
- [ ] Total users count (free vs paid)
- [ ] Revenue metrics
- [ ] Event attendance stats
- [ ] Most active users
- [ ] Upcoming events calendar view

#### 4.2 User Profile & Settings
**New files:**
- `app/profile/page.tsx` - User profile
- `app/settings/profile/page.tsx` - Edit profile
- `app/settings/notifications/page.tsx` - Already exists, enhance

**Features:**
- [ ] View/edit profile info
- [ ] Change password
- [ ] Notification preferences (email, SMS, push)
- [ ] Event history
- [ ] Stats (games played, win rate if tracked)

#### 4.3 Mobile Responsiveness
**Files to audit:**
- All pages for mobile layout
- Test on various screen sizes

#### 4.4 Performance Optimization
- [ ] Implement caching where appropriate
- [ ] Optimize database queries
- [ ] Add loading states
- [ ] Implement pagination for large lists

---

## Database Schema Updates Summary

### New Tables Needed:
1. `membership_tiers` - Define free vs paid plans
2. `user_memberships` - Track user membership status
3. `payments` - Payment history

### Columns to Add:
1. `users` table:
   - `membership_tier_id` (FK to membership_tiers)
   - `stripe_customer_id`

2. `events` table:
   - `price` (for non-members)
   - `free_for_members` (boolean)

---

## Environment Variables Needed

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# New - Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# New - Twilio (for SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# New - Google Calendar (if using API)
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=

# New - Shopify (if using Storefront API)
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
```

---

## Recommended Implementation Order

### Week 1-2: Complete Core Features
1. Group queue system (duo/triple/quad)
2. Force remove users
3. End event functionality
4. Admin user management page

### Week 3-4: Membership System
1. Database schema updates
2. Stripe integration
3. Membership pages
4. Event access control based on membership

### Week 5: Additional Features
1. Google Calendar integration (embed)
2. Shopify integration (Buy Button)
3. Enhanced About page
4. SMS notifications setup

### Week 6: Polish
1. Admin dashboard analytics
2. User profile enhancements
3. Mobile responsiveness
4. Testing and bug fixes

---

## Monthly Maintenance Fee Structure

### Recommended Pricing:
- **Free Tier**: $0/month
  - Can join free events
  - Pay per event for paid events
  - Basic features

- **Monthly Member**: $30-50/month
  - Free entry to all events
  - Priority queue position (optional)
  - Exclusive events access (optional)
  - Discounts on merchandise

### Implementation:
- Stripe recurring subscriptions
- Automatic billing on renewal date
- Email reminders before renewal
- Grace period for failed payments

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize features** based on business needs
3. **Set up external services** (Stripe, Twilio, etc.)
4. **Begin Phase 1 implementation**
5. **Test thoroughly** at each phase
6. **Deploy incrementally** to production

---

## Notes

- All features should maintain the existing authentication flow
- Keep RLS policies updated as new tables are added
- Ensure mobile responsiveness for all new pages
- Add comprehensive error handling
- Log all admin actions for audit trail
- Consider GDPR compliance for user data

