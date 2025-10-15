# Stripe Integration Setup Guide

## The Issue You're Experiencing

The checkout is failing because the `stripe_price_id` field in the `membership_tiers` table is **NULL**. This field is required to create Stripe checkout sessions.

## Quick Fix - 3 Steps

### 1. Create Products & Prices in Stripe Dashboard

Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)

1. Click **"+ Add Product"**
2. Fill in:
   - **Name**: `Monthly Membership` (or your tier name)
   - **Description**: `Unlimited event access with monthly subscription`
3. Under **Pricing**:
   - **Price**: `35.00`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`
4. Click **Save product**
5. **Copy the Price ID** (starts with `price_` - e.g., `price_1AB2CD3EF4GH5IJ6`)

Repeat for each paid tier you have.

### 2. Update Your Database

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) and run:

```sql
-- Replace with your actual Stripe Price ID from step 1
UPDATE membership_tiers 
SET stripe_price_id = 'price_YOUR_ACTUAL_PRICE_ID_HERE'
WHERE name = 'monthly';

-- Verify it worked
SELECT name, display_name, price, stripe_price_id 
FROM membership_tiers 
WHERE name = 'monthly';
```

### 3. Verify Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Your app URL
NEXT_PUBLIC_URL=http://localhost:3001  # or your production URL
```

## Testing the Fix

1. **Check Browser Console** for logs:
   ```
   Checkout tier loaded: { name: 'monthly', price: 35, stripePriceId: 'price_...' }
   ```

2. **Check Server Logs** (terminal running `npm run dev`):
   ```
   Creating checkout session for: { userId: '...', email: '...', priceId: 'price_...', tierName: 'monthly' }
   Checkout session created successfully: cs_test_...
   ```

3. Click **"Continue to Payment"** - should redirect to Stripe checkout page

## Common Errors & Solutions

### Error: "This plan is not configured for purchase"
**Cause**: `stripe_price_id` is NULL in database  
**Fix**: Complete Step 2 above

### Error: "Failed to create checkout session"
**Possible causes**:
- Invalid Stripe Price ID
- Wrong Stripe API keys
- Price doesn't exist in Stripe

**Fix**: 
1. Verify the Price ID exists in your Stripe Dashboard
2. Check you're using the correct API keys (test vs production)
3. Make sure the price ID in the database matches Stripe exactly

### Error: "Not authenticated"
**Cause**: User not logged in  
**Fix**: Make sure user is signed in before accessing checkout

### Error: "Invalid membership tier"
**Cause**: Tier ID doesn't exist or is inactive  
**Fix**: Check the tier exists and `is_active = true`

## Stripe Webhook Setup (For Production)

After testing works, set up webhooks to handle subscription events:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Database Schema Reference

```sql
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,           -- 'free', 'monthly', 'yearly', etc.
  display_name TEXT NOT NULL,          -- 'Monthly Member'
  description TEXT,
  price DECIMAL(10,2) NOT NULL,        -- 35.00
  billing_period TEXT NOT NULL,        -- 'monthly', 'yearly', 'free'
  stripe_price_id TEXT,                -- ← MUST BE SET FOR PAID TIERS
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER
);
```

## Testing Checklist

- [ ] Stripe Price ID created in Stripe Dashboard
- [ ] Database updated with `stripe_price_id`
- [ ] Environment variables set correctly
- [ ] Can view membership plans page
- [ ] Can click "Upgrade" button
- [ ] Redirects to checkout page with tier details
- [ ] "Continue to Payment" redirects to Stripe
- [ ] Can complete test payment with card `4242 4242 4242 4242`
- [ ] Webhook receives events (production only)

## Support

If you're still having issues:

1. Check browser console for client-side errors
2. Check server terminal for server-side logs
3. Check Stripe Dashboard → Logs for API errors
4. Verify Supabase database has correct data

## Security Notes

✅ **What we did right:**
- Stripe Price IDs never exposed to client
- Server-side validation of all tier data
- Price ID verified against database before checkout
- User authentication required
- Tier must be active and paid to checkout

🔒 **The checkout flow:**
```
Client (tier ID only) 
  → Server (fetch full tier from DB)
  → Validate (active, paid, has stripe_price_id)
  → Stripe (create session with price_id)
  → Client (redirect URL only)
```

