<!-- 8f9b0863-9000-426a-9fbd-a3c8a7cdc9b7 dfe87bdf-2ffb-4d72-a981-92a813e77c76 -->
# Gap Analysis: What's Done vs What's Missing

## COMPLETED FEATURES ✅

### Core User Features (DONE)

1. **Authentication** - Fully working

- Sign up with email confirmation
- Login/logout
- Protected routes
- Admin access control

2. **Events System** - Fully working

- Browse events (real Supabase data)
- View event details
- Real-time updates
- Court assignments display

3. **Queue System** - Fully working

- Join/leave queue
- Solo + Group support (Duo/Triple/Quad) in UI
- Skill level selection
- Real-time queue updates
- Position tracking
- Group display with badges

4. **Membership System (Stripe)** - Complete code, waiting for API keys

- Pricing page (/membership)
- Checkout flow
- Success/cancel pages
- Webhook handler
- Event access control based on membership
- Manage membership page (/settings/membership)
- Cancel/reactivate subscription

5. **Admin Features** - Partially working

- Create/edit events ✅ (Supabase connected)
- Delete events ✅
- End event ✅ (status changes, but doesn't clear queue/assignments)
- Force remove users ✅ (UI only, needs Supabase)
- Manual assign players ✅ (UI only, needs Supabase)
- Admin dashboard ✅
- Admin-only access ✅

6. **Pages & Content**

- Home page ✅
- About page ✅ (has content)
- Events listing ✅
- Event detail ✅
- Login/signup ✅
- Settings (notifications) ✅

7. **Notifications**

- Browser notifications ✅
- Queue position alerts ✅
- Settings page ✅

---

## MISSING FEATURES ❌

### 1. Google Calendar Page (MISSING)

**Required:** Yes - you specifically mentioned "google calendar page for events"
**File needed:** app/calendar/page.tsx
**Effort:** 30 minutes (simple embed)

### 2. Shopify Link (MISSING)

**Required:** Yes - you mentioned "link to shopify store"
**Location:** Add to Header navigation
**Effort:** 5 minutes

### 3. Admin Tools - Database Integration (PARTIAL)

**Currently:** Admin event detail page uses MOCK data
**Files affected:**

- app/admin/events/[id]/page.tsx (line 136-142 uses mockData)
- Need to connect force remove to Supabase
- Need to connect assign players to Supabase

**Status:** UI exists but not connected to real database
**Effort:** 2-3 hours

### 4. End Event - Clear Data (INCOMPLETE)

**Currently:** Changes status to "ended" but doesn't clear queue/assignments
**Required:** Delete queue entries and assignments when event ends
**File:** app/admin/page.tsx (line 175-196)
**Effort:** 30 minutes

### 5. Auto-assign Next Matchups (MISSING)

**Currently:** Admin manually clicks "Assign Next Players"
**Required:** Automatic assignment when courts become available
**Effort:** 1-2 hours (requires background job or webhook)
**Note:** This is complex - may need to defer to Phase 2

---

## REQUIREMENTS CHECKLIST

### User-side Requirements

- [x] Join event
- [x] Enter skill level (in join dialog)
- [x] Join or leave queue
- [x] See who's up next
- [x] Real-time updates of court assignments
- [x] Web alerts when it's their turn (browser notifications)
- [ ] Push notifications (Phase 2 - defer)
- [ ] SMS/text alerts (Phase 2 - defer, needs Twilio)

### Admin-side Requirements

- [x] Create events
- [x] Edit events
- [x] End events (changes status, needs to clear data)
- [x] Manage court count (in create/edit)
- [x] Manage rotation logic (2-stay, 4-off, etc. - in create/edit)
- [x] Force-remove users (UI done, needs database connection)
- [x] Assign next match-ups (UI done, needs database connection)
- [ ] AUTO-assign next match-ups (missing, complex)
- [ ] End session deletes all event data (partially done, needs queue/assignment clearing)

### Group Queue Requirements

- [x] Duo (2 players)
- [x] Triple (3 players)
- [x] Quad (4 players)
- [x] Groups display together
- [x] Groups stay together in queue

### Website Requirements

- [x] About page
- [ ] Google calendar page (MISSING)
- [x] Membership feature (free vs paid)
- [x] Auto monthly membership (Stripe integration complete)
- [x] Free entry to events for paid members
- [ ] Link to Shopify store (MISSING)
- [x] Monthly maintenance fee (Stripe subscription)

---

## MVP 3-WEEK PLAN STATUS

### Week 1 (Oct 9-15) - COMPLETED

- [x] Days 1-2: Group Queue ✅
- [x] Days 3-4: Stripe Setup ✅ (code done, needs API keys)
- [x] Days 5-6: Membership Pages ✅
- [x] Day 7: Webhook Handler ✅

### Week 2 (Oct 16-22) - IN PROGRESS

- [x] Days 8-9: Event Access Control ✅
- [x] Days 10-11: Manage Membership Page ✅
- [ ] Days 12-13: Admin Tools (UI done, database connection needed)
- [ ] Day 14: Database Migration (Stripe tables need to be run)

### Week 3 (Oct 23-31) - NOT STARTED

- [ ] Days 15-16: Content & Polish
- [x] About Page ✅
- [ ] Google Calendar page (MISSING)
- Home page (could be better)
- [ ] Days 17-18: Testing
- [ ] Days 19-20: Production Setup
- [ ] Days 21-22: Final Testing & Launch

---

## WHAT TO DO NEXT

Since you're waiting on Stripe API keys, here's what can be done in parallel:

### Priority 1 (Can do now - 1-2 hours)

1. Create Google Calendar page (app/calendar/page.tsx)
2. Add Shopify link to Header
3. Fix End Event to clear queue and assignments
4. Connect admin event detail page to Supabase (remove mock data)

### Priority 2 (After Stripe is configured - 1 hour)

1. Test full Stripe flow
2. Run membership database migration (scripts/02-membership-tables.sql)
3. Test membership access control

### Priority 3 (Nice to have - Phase 2)

1. Auto-assign next matchups (complex background job)
2. SMS notifications (needs Twilio)
3. Enhanced home page
4. Push notifications

---

## CRITICAL NOTES

1. **Admin Event Detail Page**: Currently uses MOCK DATA (lines 136-142)

- mockEvent, mockQueue, mockAssignments, mockUsers
- Force remove and assign players work in UI but don't save to database
- MUST connect to Supabase before launch

2. **End Event Function**: Only changes status, doesn't:

- Clear queue entries
- Clear court assignments
- Archive event data

3. **Stripe**: All code ready, just needs:

- API keys in .env.local
- Create product in Stripe dashboard
- Run scripts/02-membership-tables.sql
- Set up webhook endpoint

4. **Group Queue**: 

- UI fully supports groups
- Database schema supports group_id
- Currently only authenticated user joins (other player names not persisted)
- This is intentional - only registered users can join

---

## SUMMARY

**Overall Progress: ~85% complete**

**What's blocking launch:**

1. Google Calendar page (30 min)
2. Shopify link (5 min)
3. Admin tools database connection (2-3 hours)
4. End Event clearing data (30 min)
5. Stripe API configuration (your part)

**Estimated time to MVP:** 3-4 hours of dev work + your Stripe setup

**Phase 2 items (defer):**

- Auto-assign automation
- SMS notifications
- Push notifications
- Advanced analytics

### To-dos

- [ ] Create Google Calendar page with embedded calendar
- [ ] Add Shopify store link to Header navigation
- [ ] Update End Event to delete queue entries and court assignments
- [ ] Connect admin event detail page to Supabase (remove mock data)
- [ ] Connect force remove to Supabase leaveQueue action
- [ ] Connect assign players to Supabase court_assignments table