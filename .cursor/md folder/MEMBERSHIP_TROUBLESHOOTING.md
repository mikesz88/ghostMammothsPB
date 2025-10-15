# Membership Not Showing? Troubleshooting Guide

## Quick Diagnosis

Visit this URL while logged in: **`/api/debug/membership`**

This will show you exactly what's in your database for your user.

## The Issue

The UI reads membership from `user_memberships` table (primary) and `users.membership_status` (fallback). If both are mismatched or missing data, it shows "Free Member".

## Common Scenarios & Fixes

### Scenario 1: Only `users.membership_status` is set

**What you see:**
```
users.membership_status = "Community Fan Club Member"  ✅
user_memberships table = empty ❌
```

**Why:** You manually updated the users table, but user_memberships wasn't created.

**Fix:** Create the user_memberships record:

```sql
-- First, get your tier ID
SELECT id, name, display_name FROM membership_tiers WHERE display_name = 'Community Fan Club Member';
-- Copy the ID

-- Then create membership record (replace <tier-id> and <user-id>)
INSERT INTO user_memberships (user_id, tier_id, status, updated_at)
VALUES ('<user-id>', '<tier-id>', 'active', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  tier_id = EXCLUDED.tier_id,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

-- Also update users table with internal name, not display name
UPDATE users
SET membership_status = (
  SELECT name FROM membership_tiers 
  WHERE display_name = 'Community Fan Club Member'
)
WHERE id = '<user-id>';
```

### Scenario 2: Tier name mismatch

**What you see:**
```
users.membership_status = "Community Fan Club Member" (display name) ❌
Should be: "community_fan_club" (internal name) ✅
```

**Fix:** The code now handles BOTH! But for consistency, run:

```sql
-- Check what the internal name should be
SELECT name, display_name FROM membership_tiers 
WHERE display_name = 'Community Fan Club Member';

-- Update users.membership_status to use internal name
UPDATE users
SET membership_status = '<internal-name-from-above>'
WHERE membership_status = 'Community Fan Club Member';
```

### Scenario 3: After completing Stripe checkout, still shows Free

**Possible causes:**
1. Webhooks aren't set up (normal in development)
2. verify-session endpoint failed
3. Database permissions issue

**Fix:**

**Step 1 - Check browser console:**
```
Look for: "✅ user_memberships record created/updated for user: ..."
         "✅ users.membership_status updated to: ..."
```

**Step 2 - Check server logs:**
```
Look for: "Session verified for user: ... Tier: ..."
         "Checkout completed for user ..."
```

**Step 3 - Manually verify in Supabase:**
```sql
-- Check what's actually in your database
SELECT 
  u.email,
  u.membership_status,
  um.status as membership_status_from_table,
  mt.name as tier_internal_name,
  mt.display_name as tier_display_name
FROM users u
LEFT JOIN user_memberships um ON um.user_id = u.id
LEFT JOIN membership_tiers mt ON mt.id = um.tier_id
WHERE u.email = 'your@email.com';
```

## Understanding the Data Flow

**After successful checkout:**

1. **Success page loads** → Calls `/api/stripe/verify-session`
2. **verify-session updates:**
   - ✅ Creates/updates `user_memberships` record
   - ✅ Sets `users.membership_status` to tier.name
3. **UI calls `getUserMembership()`**
   - Reads `user_memberships` table (primary)
   - Falls back to `users.membership_status` if empty
   - Matches by internal name OR display name

## Quick Fix Commands

### If membership showing wrong after purchase:

```sql
-- 1. Find your user ID
SELECT id, email, membership_status FROM users WHERE email = 'your@email.com';

-- 2. Find the tier ID
SELECT id, name, display_name FROM membership_tiers WHERE display_name = 'Community Fan Club Member';

-- 3. Create/fix user_memberships record
INSERT INTO user_memberships (user_id, tier_id, status, updated_at)
VALUES (
  '<your-user-id>', 
  '<tier-id-from-step-2>', 
  'active', 
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  tier_id = EXCLUDED.tier_id,
  status = 'active',
  updated_at = NOW();

-- 4. Fix users.membership_status to use internal name
UPDATE users
SET membership_status = (SELECT name FROM membership_tiers WHERE id = '<tier-id-from-step-2>')
WHERE id = '<your-user-id>';

-- 5. Verify it worked
SELECT 
  u.email,
  u.membership_status,
  mt.name as tier_name,
  mt.display_name as tier_display_name,
  mt.price
FROM users u
JOIN user_memberships um ON um.user_id = u.id
JOIN membership_tiers mt ON mt.id = um.tier_id
WHERE u.id = '<your-user-id>';
```

## Code Changes Made

### `lib/membership-helpers.ts`
Now checks BOTH tables with smart fallback:
1. Tries `user_memberships` table first (correct way)
2. Falls back to `users.membership_status` field
3. Matches by internal name OR display name (handles both)
4. Logs what it finds for debugging

### `app/api/stripe/verify-session/route.ts`
Now creates complete records:
- Creates `user_memberships` with full data
- Updates `users.membership_status` with internal name
- Fetches subscription period dates
- Comprehensive error logging

## Testing Steps

1. **Check debug endpoint:** `/api/debug/membership`
   - Shows exactly what's in database
   - Shows what `getUserMembership()` will return

2. **Check browser console:**
   - Should see: "Found tier from users.membership_status fallback"
   - Shows what tier was found

3. **Try logging out and back in:**
   - Sometimes auth context needs refresh

4. **Hard refresh page:**
   - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Clears cached data

## Expected Database State

After successful purchase, you should have:

```
users table:
  membership_status: "community_fan_club" (internal name)
  stripe_customer_id: "cus_..."

user_memberships table:
  user_id: your-uuid
  tier_id: tier-uuid
  status: "active"
  stripe_customer_id: "cus_..."
  stripe_subscription_id: "sub_..."
  current_period_start: timestamp
  current_period_end: timestamp

payments table:
  (should have a record with the payment amount)
```

If any of these are missing, the webhooks didn't fire or the verify-session failed!

