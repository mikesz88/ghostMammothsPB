# Stripe Customer Portal Setup

## The Issue

Getting error: **"Failed to create portal session"**

This happens when the **Stripe Customer Portal** is not activated in your Stripe account.

## Quick Fix - Activate Customer Portal

### Step 1: Go to Stripe Settings
Visit: https://dashboard.stripe.com/settings/billing/portal

### Step 2: Activate the Portal
1. Click **"Activate link"** or **"Turn on customer portal"**
2. Configure the settings:

**Recommended Settings:**

**Invoice history**
- ✅ Allow customers to view their invoice history

**Update payment method**
- ✅ Allow customers to update payment methods
- Link opens in: Same tab ✓

**Cancel subscriptions**
- ✅ Allow customers to cancel subscriptions
- Cancellation behavior: **Cancel at end of billing period** ✓
- Customer feedback: Optional

**Update subscription**
- ⬜ Allow customers to switch plans (optional - only if you have multiple tiers)

### Step 3: Save Changes
Click **"Save"** at the bottom

### Step 4: Test Again
- Go back to your app
- Click **"Manage Billing"**
- Should now open the Stripe Customer Portal ✅

## Common Errors & Solutions

### Error: "Customer portal is not enabled"
**Cause:** Portal not activated in Stripe dashboard  
**Fix:** Follow steps above

### Error: "Customer has been deleted"
**Cause:** Customer ID exists in database but was deleted from Stripe  
**Fix:** Re-create customer through a new checkout, or remove the invalid customer ID from database

### Error: "Invalid customer ID"
**Cause:** Customer ID format is wrong or doesn't exist in Stripe  
**Fix:** Check Stripe dashboard for valid customer ID

### Success! What you should see:
After clicking "Manage Billing", you should be redirected to a Stripe-hosted page showing:
- Current subscription details
- Payment method update form
- Option to cancel subscription
- Invoice history
- Download receipts

## For Development (Test Mode)

If you're using Stripe test mode:
1. Make sure you activated the portal for **test mode** (toggle in top right)
2. Use test customer IDs (start with `cus_test_`)
3. Portal works the same in test mode

## Checking Server Logs

When you click "Manage Billing", check your server terminal for:

**Success:**
```
Creating billing portal session for customer: cus_TF0HaxJBojw1Qy
Customer verified in Stripe: { id: 'cus_...', email: '...' }
✅ Billing portal session created: bps_...
```

**Failure:**
```
❌ Error creating portal session: [error details]
Error message: [specific error from Stripe]
```

The error message will tell you exactly what's wrong!

## Alternative: Use Stripe CLI

If portal still doesn't work, check your Stripe configuration:

```bash
stripe config --list
stripe customers list --limit 5
stripe billing_portal configurations list
```

## Production Checklist

Before going live:
- [ ] Customer Portal activated in LIVE mode (not just test)
- [ ] Portal settings configured (cancel behavior, payment methods, etc.)
- [ ] Return URL is your production domain
- [ ] Test with real customer in Stripe dashboard
- [ ] Verify portal opens and all features work

## Need More Help?

Check your server terminal logs after clicking "Manage Billing" - it will show the exact Stripe error!

