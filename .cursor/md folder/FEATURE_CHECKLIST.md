# Ghost Mammoths PB - Feature Checklist

## Core Requirements Alignment

### ✅ User-Side Features

| Feature | Status | Notes | Priority |
|---------|--------|-------|----------|
| Join event | ✅ Complete | Users can browse and join events | HIGH |
| Enter skill level | ✅ Complete | Set during signup, can be updated | HIGH |
| Join queue (solo) | ✅ Complete | Users can join queue individually | HIGH |
| Join queue (duo) | 🚧 Partial | Schema supports it, UI needed | HIGH |
| Join queue (triple) | 🚧 Partial | Schema supports it, UI needed | HIGH |
| Join queue (quad) | 🚧 Partial | Schema supports it, UI needed | HIGH |
| Leave queue | ✅ Complete | Users can remove themselves | HIGH |
| See who's up next | ✅ Complete | Queue list shows position | HIGH |
| Real-time court assignments | ✅ Complete | Hooks created, needs testing | HIGH |
| Push notifications | 🚧 Partial | Framework exists, needs implementation | MEDIUM |
| Web notifications | 🚧 Partial | Framework exists, needs implementation | MEDIUM |
| Text/SMS alerts | ❌ Not Started | Twilio integration needed | MEDIUM |

### ✅ Admin-Side Features

| Feature | Status | Notes | Priority |
|---------|--------|-------|----------|
| Create events | ✅ Complete | Full CRUD for events | HIGH |
| Edit events | ✅ Complete | Can modify event details | HIGH |
| End events | ❌ Not Started | Need to implement session end | HIGH |
| Manage court count | ✅ Complete | Can set number of courts | HIGH |
| Rotation logic (2-stay-4-off) | ✅ Complete | QueueManager implements this | HIGH |
| Rotation logic (4-off) | ✅ Complete | Supported in rotation types | HIGH |
| Force-remove users | 🚧 Partial | Backend ready, UI needed | HIGH |
| Auto-assign next match-ups | ✅ Complete | QueueManager.assignNextPlayers | HIGH |
| End session (delete data) | ❌ Not Started | Need confirmation flow | HIGH |
| View all users | ❌ Not Started | Admin user management page needed | HIGH |
| Edit user info | ❌ Not Started | Admin user management needed | MEDIUM |
| View user history | ❌ Not Started | Track attendance and payments | MEDIUM |

### 🆕 Website Features

| Feature | Status | Notes | Priority |
|---------|--------|-------|----------|
| About page | 🚧 Partial | Basic structure exists, needs content | HIGH |
| Google Calendar integration | ❌ Not Started | Embed or API integration | HIGH |
| Membership feature (free vs paid) | ❌ Not Started | Database schema created | HIGH |
| Auto monthly billing | ❌ Not Started | Stripe subscriptions needed | HIGH |
| Free event entry for paid members | ❌ Not Started | Access control logic needed | HIGH |
| E-commerce (Shopify) | ❌ Not Started | Shopify Buy Button or API | MEDIUM |
| Monthly maintenance fee | ❌ Not Started | Part of membership system | HIGH |

---

## Detailed Implementation Status

### 1. Queue Management System

#### Solo Queue ✅
- [x] Join queue as individual
- [x] Leave queue
- [x] See position in queue
- [x] Real-time updates

#### Group Queue 🚧
- [x] Database schema supports groups (group_id, group_size)
- [ ] UI for selecting group size (duo/triple/quad)
- [ ] Group formation logic
- [ ] Display grouped players in queue
- [ ] Assign groups together to courts
- [ ] Handle partial groups (e.g., duo + 2 solos)

**Implementation needed:**
```typescript
// components/join-queue-dialog.tsx
- Add radio buttons for group size selection
- If duo/triple/quad selected, show additional player inputs
- Generate group_id for the group
- Submit all players with same group_id

// app/events/[id]/page.tsx
- Display group indicators in queue list
- Show "Group of 2/3/4" badge
- List all group members together

// lib/queue-manager.ts
- Update assignNextPlayers to respect groups
- Keep groups together when assigning to courts
- Handle mixed scenarios (groups + solos)
```

### 2. Admin Features

#### Event Management ✅
- [x] Create event form
- [x] Edit event details
- [x] Set court count
- [x] Choose rotation type
- [x] View event details
- [ ] End event with confirmation
- [ ] Archive completed events
- [ ] Event analytics (attendance, revenue)

#### User Management ❌
**Needs complete implementation:**

**Page: `/app/admin/users/page.tsx`**
- [ ] List all users with search/filter
- [ ] Show membership status
- [ ] Show total events attended
- [ ] Quick actions (edit, delete, toggle admin)
- [ ] Export user list

**Page: `/app/admin/users/[id]/page.tsx`**
- [ ] User profile details
- [ ] Edit user information
- [ ] View event history
- [ ] View payment history
- [ ] Membership management
- [ ] Send notifications to user

**Actions needed:**
```typescript
// app/actions/admin-users.ts
- getAllUsers(filters)
- getUserById(id)
- updateUser(id, data)
- deleteUser(id)
- toggleAdminStatus(id)
- getUserEventHistory(id)
- getUserPaymentHistory(id)
```

#### Queue Management 🚧
- [x] View queue in real-time
- [x] Auto-assign players to courts
- [ ] Force remove user from queue
- [ ] Manually reorder queue
- [ ] Clear entire queue

**Implementation needed:**
```typescript
// app/admin/events/[id]/page.tsx
- Add "Remove" button next to each queue entry
- Add confirmation dialog
- Log admin action

// app/actions/queue.ts
export async function adminRemoveFromQueue(
  queueEntryId: string,
  adminId: string,
  reason?: string
) {
  // Remove user from queue
  // Log admin action
  // Send notification to user
}
```

### 3. Membership System

#### Database Schema ✅
- [x] membership_tiers table
- [x] user_memberships table
- [x] payments table
- [x] event_registrations table
- [x] RLS policies
- [x] Helper functions

#### Stripe Integration ❌
**Complete setup needed:**

1. **Install Stripe**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Create Stripe files:**
   - `lib/stripe/client.ts` - Client-side Stripe
   - `lib/stripe/server.ts` - Server-side operations
   - `app/api/webhooks/stripe/route.ts` - Webhook handler

3. **Stripe Products Setup:**
   - Create "Monthly Membership" product in Stripe Dashboard
   - Create recurring price ($35/month)
   - Get Price ID for database

4. **Environment Variables:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Membership Pages ❌
**Pages to create:**

1. **`/app/membership/page.tsx`**
   - Display membership tiers
   - Feature comparison
   - Pricing cards
   - "Upgrade Now" buttons

2. **`/app/membership/checkout/page.tsx`**
   - Stripe checkout integration
   - Payment form
   - Success/error handling

3. **`/app/settings/membership/page.tsx`**
   - Current membership status
   - Billing history
   - Cancel/upgrade options
   - Payment method management

#### Event Access Control ❌
**Logic to implement:**

```typescript
// Before allowing user to join queue:
1. Check if event requires payment
2. Check user's membership status
3. If free member and event costs money:
   - Show "Pay $X to join" or "Upgrade to Monthly"
4. If monthly member:
   - Allow free entry
5. Create event_registration record
6. Track payment if required
```

### 4. Additional Features

#### Google Calendar 📅
**Option 1: Embed (Recommended for MVP)**
```typescript
// app/calendar/page.tsx
<iframe 
  src="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID"
  style="border: 0"
  width="800"
  height="600"
/>
```

**Option 2: API Integration**
- Sync events to Google Calendar
- Allow users to add to personal calendar
- Two-way sync (more complex)

#### Shopify Integration 🛒
**Option 1: Buy Button (Recommended for MVP)**
```typescript
// app/shop/page.tsx
// Embed Shopify Buy Button
<div id="product-component"></div>
<script>
  // Shopify Buy Button script
</script>
```

**Option 2: Storefront API**
- Fetch products via API
- Custom product display
- Checkout via Shopify

#### SMS Notifications 📱
**Twilio Setup:**

1. **Install Twilio**
   ```bash
   npm install twilio
   ```

2. **Create Twilio service:**
   ```typescript
   // lib/twilio.ts
   import twilio from 'twilio';
   
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   export async function sendSMS(to: string, message: string) {
     return client.messages.create({
       body: message,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: to
     });
   }
   ```

3. **Send notifications:**
   ```typescript
   // When user is up next:
   await sendSMS(
     user.phone,
     `You're up next at ${event.name}! Please head to court ${courtNumber}.`
   );
   ```

#### About Page Enhancement 📄
**Content needed:**
- Organization history
- Mission statement
- Team photos
- Contact information
- Location/facility details
- Testimonials
- FAQ section

---

## Priority Matrix

### 🔴 Critical (Must have for launch)
1. Complete group queue (duo/triple/quad)
2. Force remove users from queue
3. End event functionality
4. Membership system (free vs paid)
5. Stripe integration for billing
6. Event access control based on membership

### 🟡 Important (Should have soon)
1. Admin user management page
2. Google Calendar integration
3. SMS notifications
4. Enhanced about page
5. User profile and settings
6. Payment history

### 🟢 Nice to have (Can wait)
1. Shopify integration
2. Advanced analytics
3. Mobile app
4. Social features
5. Leaderboards
6. Tournament mode

---

## Testing Checklist

### Authentication
- [ ] Sign up with email confirmation
- [ ] Log in with correct credentials
- [ ] Log in fails with wrong credentials
- [ ] Password reset flow
- [ ] Session persistence
- [ ] Logout functionality

### Queue System
- [ ] Join queue as solo
- [ ] Join queue as duo/triple/quad
- [ ] Leave queue
- [ ] Queue position updates in real-time
- [ ] Can't join same event twice
- [ ] Queue reorders correctly after removal

### Admin Functions
- [ ] Create event
- [ ] Edit event
- [ ] Delete event
- [ ] Assign players to courts
- [ ] Remove user from queue
- [ ] End event
- [ ] View user list
- [ ] Edit user details

### Membership
- [ ] Free member can view events
- [ ] Free member must pay for paid events
- [ ] Monthly member gets free entry
- [ ] Stripe checkout works
- [ ] Subscription renews automatically
- [ ] Can cancel subscription
- [ ] Cancelled subscription expires at period end

### Payments
- [ ] Stripe payment succeeds
- [ ] Failed payment handled gracefully
- [ ] Refund processes correctly
- [ ] Payment history displays correctly
- [ ] Webhook updates membership status

---

## Deployment Checklist

### Environment Setup
- [ ] Production Supabase project
- [ ] Stripe production keys
- [ ] Twilio production account
- [ ] Domain name configured
- [ ] SSL certificate
- [ ] Environment variables set

### Database
- [ ] Run all migration scripts
- [ ] Set up RLS policies
- [ ] Create indexes
- [ ] Backup strategy in place

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Uptime monitoring
- [ ] Performance monitoring

### Security
- [ ] Rate limiting
- [ ] CORS configured
- [ ] API keys secured
- [ ] Input validation
- [ ] XSS protection
- [ ] CSRF protection

---

## Next Immediate Steps

1. **Week 1: Complete Core Queue Features**
   - [ ] Implement group queue UI
   - [ ] Add force remove functionality
   - [ ] Add end event feature
   - [ ] Test all queue scenarios

2. **Week 2: Admin User Management**
   - [ ] Create admin users page
   - [ ] Create user detail page
   - [ ] Implement user CRUD operations
   - [ ] Add user search/filter

3. **Week 3-4: Membership System**
   - [ ] Set up Stripe account
   - [ ] Implement Stripe integration
   - [ ] Create membership pages
   - [ ] Implement event access control
   - [ ] Test payment flows

4. **Week 5: Additional Features**
   - [ ] Google Calendar integration
   - [ ] Shopify integration
   - [ ] Enhanced about page
   - [ ] SMS notifications setup

5. **Week 6: Testing & Polish**
   - [ ] Comprehensive testing
   - [ ] Bug fixes
   - [ ] Mobile responsiveness
   - [ ] Performance optimization
   - [ ] Documentation

---

## Questions to Answer

1. **Membership Pricing:**
   - What should the monthly membership cost? (Suggested: $30-50)
   - Should there be annual discount?
   - Student/senior discounts?

2. **Event Pricing:**
   - How much for non-members per event? (Suggested: $10-15)
   - Should some events be always free?
   - Member-only events?

3. **Queue Rules:**
   - Priority for monthly members?
   - Time limits for queue position?
   - Penalties for no-shows?

4. **Notifications:**
   - How far in advance to notify? (Suggested: when 4 people ahead)
   - SMS for everyone or opt-in?
   - Email notifications?

5. **Shopify:**
   - What products to sell? (Paddles, balls, apparel, memberships?)
   - Inventory management?
   - Shipping options?

6. **Google Calendar:**
   - Public calendar or private?
   - Who can add events?
   - Sync frequency?

