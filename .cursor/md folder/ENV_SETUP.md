# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id

# Application URL
NEXT_PUBLIC_URL=http://localhost:3001

# Twilio (Optional - for SMS notifications - Phase 2)
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890
```

---

## How to Get Each Variable

### Supabase (Already Have)
1. Go to Supabase Dashboard → Settings → API
2. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Stripe Secret Keys
1. Go to https://dashboard.stripe.com
2. Sign up/log in
3. Go to Developers → API keys
4. Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Click "Reveal test key" for Secret key → `STRIPE_SECRET_KEY`

### Stripe Webhook Secret
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Click "Reveal" on Signing secret → `STRIPE_WEBHOOK_SECRET`

### Stripe Price ID
1. Go to Products → Add product
2. Name: "Monthly Membership"
3. Description: "Unlimited access to all events"
4. Pricing: $35.00 USD
5. Billing period: Monthly
6. Click "Save product"
7. Copy the Price ID (starts with `price_`) → `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`

### Application URL
- Development: `http://localhost:3001`
- Production: `https://your-domain.com`

---

## Testing with Stripe Test Mode

### Test Card Numbers
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

### Test Details
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

---

## Local Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

---

## Production Setup

### Before Deploying:
1. Switch Stripe to live mode
2. Get live API keys
3. Create live webhook endpoint
4. Update environment variables in Vercel/hosting
5. Test with real card (small amount)
6. Verify webhook events are received

### Vercel Environment Variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Make sure to use production Stripe keys
4. Set `NEXT_PUBLIC_URL` to your production domain

---

## Security Notes

### Never Commit:
- ❌ `.env.local` (already in .gitignore)
- ❌ Stripe secret keys
- ❌ Webhook secrets
- ❌ Any API keys

### Safe to Commit:
- ✅ `.env.example` (template with placeholders)
- ✅ This ENV_SETUP.md file

### Key Security:
- Use test keys in development
- Use live keys only in production
- Rotate keys if compromised
- Never expose secret keys in client-side code

