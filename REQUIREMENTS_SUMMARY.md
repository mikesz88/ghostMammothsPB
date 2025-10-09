# Ghost Mammoths PB - Requirements Summary

## 📊 Current Status

### What's Working ✅
- User authentication (signup, login, email confirmation)
- Event browsing and details
- Solo queue system (join/leave)
- Real-time updates framework
- Admin event management (create, edit)
- Court assignment algorithm
- Database with RLS security
- Mobile-responsive UI

### What Needs Work 🚧

#### High Priority (Launch Blockers)
1. **Group Queue System** - Duo, triple, quad support
2. **Membership System** - Free vs Paid tiers
3. **Payment Integration** - Stripe for subscriptions
4. **Admin User Management** - View/edit all users
5. **Force Remove Users** - Admin can remove from queue
6. **End Event** - Complete and archive events

#### Medium Priority (Post-Launch)
1. **Google Calendar** - Event calendar integration
2. **SMS Notifications** - Text alerts via Twilio
3. **About Page** - Complete organization info
4. **Shopify Integration** - E-commerce for merchandise

---

## 🎯 Core Requirements Alignment

### User Features ✅ vs ❌

| Requirement | Status | Notes |
|-------------|--------|-------|
| Join event | ✅ | Working |
| Enter skill level | ✅ | During signup |
| Join/leave queue | ✅ | Solo only |
| **Duo/triple/quad groups** | ❌ | **NEEDS IMPLEMENTATION** |
| See who's up next | ✅ | Queue list |
| Real-time court assignments | ✅ | Framework ready |
| Push/web alerts | 🚧 | Partial |
| **Text/SMS alerts** | ❌ | **NEEDS TWILIO** |

### Admin Features ✅ vs ❌

| Requirement | Status | Notes |
|-------------|--------|-------|
| Create/edit events | ✅ | Working |
| **End events** | ❌ | **NEEDS IMPLEMENTATION** |
| Manage court count | ✅ | Working |
| Rotation logic (2-stay, 4-off) | ✅ | Working |
| **Force-remove users** | ❌ | **NEEDS UI** |
| Auto-assign match-ups | ✅ | Working |
| **End session (delete data)** | ❌ | **NEEDS IMPLEMENTATION** |
| **View/manage all users** | ❌ | **NEEDS PAGE** |

### Website Features ✅ vs ❌

| Requirement | Status | Notes |
|-------------|--------|-------|
| **About page** | 🚧 | **NEEDS CONTENT** |
| **Google Calendar** | ❌ | **NEEDS INTEGRATION** |
| **Membership (free vs paid)** | ❌ | **NEEDS IMPLEMENTATION** |
| **Auto monthly billing** | ❌ | **NEEDS STRIPE** |
| **Free events for paid members** | ❌ | **NEEDS LOGIC** |
| **Shopify e-commerce** | ❌ | **NEEDS INTEGRATION** |
| **Monthly maintenance fee** | ❌ | **PART OF MEMBERSHIP** |

---

## 💰 Membership System Requirements

### Free Tier
- **Cost:** $0
- **Features:**
  - Can join free events
  - Must pay per event for paid events
  - Basic notifications
  - Standard queue position

### Monthly Tier
- **Cost:** $30-50/month (to be decided)
- **Features:**
  - **Free entry to ALL events**
  - Auto-billing monthly
  - Priority queue position (optional)
  - Exclusive events access (optional)
  - Merchandise discounts
  - SMS notifications

### Implementation Status
- ✅ Database schema created
- ❌ Stripe integration needed
- ❌ Membership pages needed
- ❌ Event access control needed
- ❌ Billing system needed

---

## 📋 Implementation Roadmap

### Phase 1: Core Features (2 weeks)
**Goal:** Complete queue system and admin tools

1. **Group Queue (3 days)**
   - UI for duo/triple/quad selection
   - Group formation logic
   - Display grouped players
   - Assign groups to courts together

2. **Admin Tools (3 days)**
   - Force remove users from queue
   - End event functionality
   - Admin user management page
   - User edit/delete capabilities

3. **Testing (2 days)**
   - Test all queue scenarios
   - Test admin functions
   - Bug fixes

### Phase 2: Membership & Payments (2 weeks)
**Goal:** Enable paid memberships and event fees

1. **Stripe Setup (2 days)**
   - Create Stripe account
   - Set up products and prices
   - Install Stripe SDK
   - Configure webhooks

2. **Membership System (5 days)**
   - Membership pages (pricing, checkout, manage)
   - Stripe checkout integration
   - Webhook handler
   - Subscription management

3. **Event Access Control (2 days)**
   - Check membership before queue join
   - Payment flow for non-members
   - Event registration tracking

4. **Testing (1 day)**
   - Test payment flows
   - Test membership upgrades/cancellations
   - Test event access logic

### Phase 3: Additional Features (1 week)
**Goal:** Complete website features

1. **Google Calendar (1 day)**
   - Embed public calendar
   - OR set up API integration

2. **Shopify Integration (1 day)**
   - Embed Buy Button
   - OR set up Storefront API

3. **About Page (1 day)**
   - Add content
   - Add photos
   - Add contact info

4. **SMS Notifications (2 days)**
   - Set up Twilio
   - Implement SMS sending
   - Add notification preferences

### Phase 4: Polish & Launch (1 week)
**Goal:** Production-ready application

1. **Testing (3 days)**
   - Comprehensive testing
   - Mobile testing
   - Payment testing
   - Load testing

2. **Deployment (2 days)**
   - Set up production environment
   - Configure domain
   - Set up monitoring
   - Deploy

3. **Documentation (1 day)**
   - User guide
   - Admin guide
   - API documentation

---

## 🔧 Technical Requirements

### Services Needed

1. **Supabase** ✅
   - Already set up
   - Database, auth, real-time

2. **Stripe** ❌
   - For payments and subscriptions
   - Need account and API keys
   - Estimated cost: 2.9% + $0.30 per transaction

3. **Twilio** ❌
   - For SMS notifications
   - Need account and phone number
   - Estimated cost: $0.0079 per SMS

4. **Google Calendar** ❌
   - Public calendar (free)
   - OR API access (free)

5. **Shopify** ❌
   - Basic plan: $29/month
   - OR use Buy Button (free)

### Environment Variables Needed

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe (NEW)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Twilio (NEW)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Google Calendar (NEW - if using API)
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=

# Shopify (NEW - if using API)
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
```

---

## 💵 Cost Estimates

### Development Costs
- **Phase 1:** ~40 hours
- **Phase 2:** ~40 hours
- **Phase 3:** ~20 hours
- **Phase 4:** ~20 hours
- **Total:** ~120 hours

### Monthly Operating Costs
- **Hosting (Vercel):** $0-20/month
- **Supabase:** $0-25/month (free tier likely sufficient initially)
- **Stripe:** 2.9% + $0.30 per transaction
- **Twilio:** ~$0.01 per SMS
- **Shopify:** $0-29/month (if using full store)
- **Domain:** ~$12/year
- **Total:** ~$50-100/month + transaction fees

### Revenue Potential
**Assuming:**
- 50 monthly members @ $35/month = $1,750/month
- 20 free members @ $10/event × 4 events = $800/month
- Merchandise sales = $200/month
- **Total:** ~$2,750/month

**Net Profit:** ~$2,650/month (after operating costs)

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] Complete Phase 1 (queue + admin)
- [ ] Complete Phase 2 (membership + payments)
- [ ] Complete Phase 3 (calendar + about + shop)
- [ ] Comprehensive testing
- [ ] Set up production environment
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure email service
- [ ] Set up error monitoring
- [ ] Create user documentation
- [ ] Create admin documentation

### Launch Day
- [ ] Deploy to production
- [ ] Test all critical flows
- [ ] Monitor for errors
- [ ] Be available for support

### Post-Launch
- [ ] Gather user feedback
- [ ] Monitor analytics
- [ ] Fix bugs
- [ ] Plan Phase 2 features
- [ ] Marketing and promotion

---

## 📞 Questions for Client

1. **Membership Pricing:**
   - What should monthly membership cost?
   - What should per-event cost be for free members?
   - Any discounts (student, senior, annual)?

2. **Payment Processing:**
   - Do you have a Stripe account?
   - What's your business legal name for Stripe?
   - Tax ID for payment processing?

3. **SMS Notifications:**
   - Do you want SMS notifications?
   - Who pays for SMS costs?
   - Opt-in or opt-out?

4. **Google Calendar:**
   - Do you have a Google Calendar already?
   - Who should manage the calendar?
   - Public or private?

5. **Shopify:**
   - Do you have a Shopify store?
   - What products to sell?
   - Who manages inventory?

6. **Content:**
   - About page content?
   - Photos/videos for website?
   - Logo and branding assets?

7. **Timeline:**
   - When do you want to launch?
   - Any specific deadlines?
   - Soft launch or full launch?

---

## 📝 Notes

- All database schemas are created and ready
- Authentication system is production-ready
- Real-time infrastructure is in place
- Most UI components are built
- Main work is integrating external services (Stripe, Twilio, etc.)
- Estimated 4-6 weeks to full launch
- Can do phased rollout (core features first, then payments, then extras)

