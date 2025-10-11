# 3-Week MVP Launch Plan - End of October

**Goal:** Launch-ready Ghost Mammoths PB app by October 31st

**Current Date:** October 9th  
**Launch Target:** October 31st (22 days)

---

## 🎯 MVP Scope (Must-Have for Launch)

### Core Features Only
1. ✅ **Authentication** - DONE
2. ✅ **Events Listing** - DONE
3. ✅ **Solo Queue** - DONE
4. 🔨 **Group Queue (Duo/Triple/Quad)** - HIGH PRIORITY
5. 🔨 **Membership System (Free vs Paid)** - HIGH PRIORITY
6. 🔨 **Stripe Payments** - HIGH PRIORITY
7. 🔨 **Admin Tools (Force Remove, End Event)** - MEDIUM PRIORITY
8. 🔨 **Google Calendar** - LOW PRIORITY (embed only)
9. ✅ **Basic About Page** - DONE (just needs content)

### Features to DEFER Post-Launch
- ❌ SMS Notifications (Twilio) - Phase 2
- ❌ Shopify Integration - Phase 2
- ❌ Advanced Analytics - Phase 2
- ❌ Admin User Management Page - Phase 2 (can manage via Supabase dashboard)
- ❌ Push Notifications - Phase 2

---

## 📅 Week-by-Week Breakdown

### **Week 1: Oct 9-15 (Core Queue & Membership Setup)**

#### Days 1-2 (Oct 9-10): Group Queue Implementation
**Status:** Database ready, needs UI
- [ ] Update `components/join-queue-dialog.tsx`
  - Add radio buttons for group size (Solo/Duo/Triple/Quad)
  - Show multiple player input fields for groups
  - Generate group_id for grouped players
- [ ] Update `app/events/[id]/page.tsx`
  - Display groups together in queue
  - Show "Group of 2/3/4" badges
- [ ] Update `app/actions/queue.ts`
  - Handle group joining logic
  - Ensure groups stay together
- [ ] Test all group scenarios

**Deliverable:** Users can join queue as groups of 1-4 players

#### Days 3-4 (Oct 10-12): Stripe Setup & Integration
- [ ] Create Stripe account
- [ ] Create products in Stripe:
  - Free Membership ($0)
  - Monthly Membership ($35/month)
- [ ] Get API keys and webhook secret
- [ ] Install Stripe SDK: `npm install stripe @stripe/stripe-js`
- [ ] Create `lib/stripe/client.ts`
- [ ] Create `lib/stripe/server.ts`
- [ ] Set up environment variables

**Deliverable:** Stripe account configured and integrated

#### Day 5-6 (Oct 13-14): Basic Membership Pages
- [ ] Create `/app/membership/page.tsx`
  - Display Free vs Monthly comparison
  - Pricing cards
  - Feature list
  - "Upgrade" button
- [ ] Create `/app/membership/checkout/page.tsx`
  - Stripe checkout integration
  - Success/cancel handling
- [ ] Create `/app/membership/success/page.tsx`
  - Post-checkout success page

**Deliverable:** Users can see membership options and upgrade

#### Day 7 (Oct 15): Stripe Webhook Handler
- [ ] Create `/app/api/webhooks/stripe/route.ts`
- [ ] Handle subscription events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Update `user_memberships` table
- [ ] Test with Stripe CLI

**Deliverable:** Subscriptions sync to database

---

### **Week 2: Oct 16-22 (Membership Logic & Admin Tools)**

#### Days 8-9 (Oct 16-17): Event Access Control
- [ ] Create `lib/membership-helpers.ts`
  - Function to check if user can join event
  - Function to check membership status
- [ ] Update `app/events/[id]/page.tsx`
  - Check membership before showing "Join Queue"
  - Show "Upgrade to Join" for paid events (free users)
  - Show "Join Free" for paid members
- [ ] Update `app/actions/queue.ts`
  - Validate membership before joining
  - Create event_registration records
- [ ] Add payment flow for free users joining paid events

**Deliverable:** Membership controls event access

#### Days 10-11 (Oct 18-19): Manage Membership Page
- [ ] Create `/app/settings/membership/page.tsx`
  - Show current membership tier
  - Show billing date and amount
  - "Cancel Subscription" button
  - Payment history
- [ ] Implement cancel subscription flow
- [ ] Display payment history

**Deliverable:** Users can manage their membership

#### Days 12-13 (Oct 20-21): Admin Tools (Essential Only)
- [ ] **Force Remove User from Queue**
  - Add "Remove" button to admin queue view
  - Confirmation dialog
  - Update queue positions
- [ ] **End Event**
  - Add "End Event" button to admin event page
  - Confirmation dialog
  - Update event status to "ended"
  - Clear queue and court assignments
  - Show event summary

**Deliverable:** Admins can remove users and end events

#### Day 14 (Oct 22): Database Migration & Setup
- [ ] Run `scripts/02-membership-tables.sql` on production Supabase
- [ ] Verify all RLS policies
- [ ] Create initial membership tiers
- [ ] Test data flow end-to-end

**Deliverable:** Production database ready

---

### **Week 3: Oct 23-31 (Polish, Testing & Launch)**

#### Days 15-16 (Oct 23-24): Content & Polish
- [ ] **About Page**
  - Add organization info
  - Add contact details
  - Add photos (if available)
  - Add FAQ section
- [ ] **Google Calendar** (Simple embed)
  - Create `/app/calendar/page.tsx`
  - Embed public Google Calendar iframe
  - Add to navigation
- [ ] **Home Page Enhancement**
  - Better hero section
  - Clear CTA buttons
  - Feature highlights
  - Testimonials (if available)

**Deliverable:** Professional-looking content pages

#### Days 17-18 (Oct 25-26): Testing & Bug Fixes
- [ ] **Authentication Flow**
  - Test signup with email confirmation
  - Test login/logout
  - Test password reset (if implemented)
- [ ] **Queue System**
  - Test solo join/leave
  - Test group join/leave (all sizes)
  - Test queue positions
  - Test real-time updates
- [ ] **Membership**
  - Test free tier
  - Test upgrade to paid
  - Test subscription billing
  - Test cancellation
  - Test event access (free vs paid)
- [ ] **Admin Functions**
  - Test create/edit event
  - Test assign players
  - Test remove users
  - Test end event
- [ ] **Mobile Testing**
  - Test on phone
  - Check responsiveness
  - Fix any mobile issues

**Deliverable:** All critical paths tested and working

#### Days 19-20 (Oct 27-28): Production Setup
- [ ] Set up production Supabase project
- [ ] Configure production Stripe account
- [ ] Set up production environment variables
- [ ] Configure custom domain (if available)
- [ ] Set up SSL certificate
- [ ] Deploy to Vercel production
- [ ] Test production deployment
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Set up analytics (Google Analytics)

**Deliverable:** App running in production

#### Days 21-22 (Oct 29-31): Final Testing & Launch
- [ ] **Final Testing on Production**
  - Test all user flows
  - Test payment processing
  - Test real-time features
  - Load testing (if possible)
- [ ] **Documentation**
  - User guide (how to join events)
  - Admin guide (how to manage events)
  - FAQ page
- [ ] **Soft Launch**
  - Invite small group of beta users
  - Monitor for issues
  - Gather feedback
- [ ] **Launch Announcement**
  - Social media posts
  - Email to members
  - Website live

**Deliverable:** App launched and live! 🚀

---

## ⚡ Critical Path (Cannot Skip)

These items MUST be done for launch:
1. ✅ Group Queue UI (Days 1-2)
2. ✅ Stripe Integration (Days 3-4)
3. ✅ Membership Pages (Days 5-6)
4. ✅ Webhook Handler (Day 7)
5. ✅ Event Access Control (Days 8-9)
6. ✅ Testing (Days 17-18)
7. ✅ Production Deployment (Days 19-20)

## 🟡 Important But Flexible

Can be simplified or deferred if time runs short:
- Manage Membership Page (can be basic)
- Admin Tools (force remove can wait, end event is nice-to-have)
- Google Calendar (can launch without)
- About Page (can use placeholder)

## 🎨 Nice-to-Have (Post-Launch)

Explicitly defer to Phase 2:
- SMS Notifications
- Shopify Integration
- Admin User Management UI
- Advanced Analytics
- Push Notifications

---

## 📊 Daily Time Estimates

Assuming **8 hours/day** of focused development:

| Week | Days | Hours | Focus |
|------|------|-------|-------|
| Week 1 | 7 days | 56 hours | Group Queue + Stripe + Membership Setup |
| Week 2 | 7 days | 56 hours | Access Control + Admin Tools |
| Week 3 | 8 days | 64 hours | Polish + Testing + Launch |
| **Total** | **22 days** | **176 hours** | |

## 🚨 Risk Mitigation

### Potential Delays
1. **Stripe Integration Issues**
   - Mitigation: Start early, use Stripe docs/examples
   - Buffer: 1 extra day

2. **Real-time Updates Not Working**
   - Mitigation: Test early, simplify if needed
   - Fallback: Manual refresh button

3. **Payment Testing Takes Longer**
   - Mitigation: Use Stripe test mode extensively
   - Buffer: 1 extra day

4. **Mobile Issues**
   - Mitigation: Test early and often
   - Buffer: Already built-in with Tailwind

### Contingency Plan
If running behind schedule by Day 14:
- ✅ Keep: Group Queue, Stripe, Basic Membership
- 🟡 Simplify: Admin tools (basic only)
- ❌ Cut: Google Calendar (post-launch)
- ❌ Cut: Fancy About page (basic text only)

---

## 📋 Pre-Launch Checklist

### Technical
- [ ] All migrations run on production
- [ ] Environment variables set
- [ ] Stripe webhooks configured
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Error monitoring active
- [ ] Analytics tracking active

### Content
- [ ] About page content
- [ ] Terms of service
- [ ] Privacy policy
- [ ] FAQ section
- [ ] Contact information

### Testing
- [ ] Can sign up and confirm email
- [ ] Can join queue (solo and groups)
- [ ] Can upgrade membership
- [ ] Can process payments
- [ ] Can join events (access control works)
- [ ] Can manage membership
- [ ] Admin can create events
- [ ] Admin can remove users
- [ ] Admin can end events
- [ ] Mobile experience works

### Business
- [ ] Stripe account verified
- [ ] Bank account connected
- [ ] Pricing decided
- [ ] Membership tiers finalized
- [ ] Event pricing strategy set

---

## 💡 Success Criteria

**By October 31st, the MVP must:**
1. ✅ Allow users to sign up and log in
2. ✅ Allow users to join events (solo or groups)
3. ✅ Support two membership tiers (free & paid)
4. ✅ Process monthly subscription payments
5. ✅ Control event access based on membership
6. ✅ Allow admins to create and manage events
7. ✅ Be deployed and accessible online
8. ✅ Work on mobile devices
9. ✅ Have no critical bugs

**Nice-to-have but not required:**
- SMS notifications
- E-commerce integration
- Advanced admin dashboard
- Detailed analytics

---

## 🎯 Post-Launch (Phase 2 - November)

After successful MVP launch, focus on:
1. **Week 1-2:** SMS notifications (Twilio)
2. **Week 3:** Shopify integration
3. **Week 4:** Admin user management
4. **Ongoing:** User feedback and improvements

---

## 📞 Weekly Check-ins

**Every Monday:**
- Review last week's progress
- Identify blockers
- Adjust plan if needed
- Set week's priorities

**Every Friday:**
- Demo completed features
- Test what's built
- Plan weekend work (if needed)

---

## ⚠️ Important Notes

1. **Email Confirmation:** Already working - users must confirm email before login
2. **Test Payments:** Use Stripe test mode until final testing
3. **Database:** Run migrations on production by Week 2
4. **No Shortcuts:** Security and payments must be done right
5. **Mobile First:** Test mobile constantly, most users will be on phones
6. **Ask Questions:** If stuck on Stripe/Supabase, ask immediately

---

## 🚀 Let's Do This!

This is aggressive but achievable. Key to success:
- Focus on MVP features only
- Don't get distracted by nice-to-haves
- Test as you build
- Deploy early and often
- Keep it simple

**Ready to start? Begin with Group Queue implementation tomorrow!**

