-- Sync Stripe customer IDs from users table to user_memberships table
-- 
-- Issue: users.stripe_customer_id is populated but user_memberships.stripe_customer_id is NULL
-- This breaks "Manage Billing" and "Cancel Membership" features
--
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT 
  u.email,
  u.stripe_customer_id as users_table_customer_id,
  um.stripe_customer_id as user_memberships_customer_id,
  um.stripe_subscription_id,
  CASE 
    WHEN u.stripe_customer_id IS NOT NULL AND um.stripe_customer_id IS NULL 
    THEN '❌ NEEDS SYNC'
    ELSE '✅ OK'
  END as status
FROM users u
LEFT JOIN user_memberships um ON um.user_id = u.id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY u.email;

-- Step 2: Sync customer IDs from users to user_memberships
UPDATE user_memberships um
SET 
  stripe_customer_id = u.stripe_customer_id,
  updated_at = NOW()
FROM users u
WHERE um.user_id = u.id
  AND u.stripe_customer_id IS NOT NULL
  AND (um.stripe_customer_id IS NULL OR um.stripe_customer_id != u.stripe_customer_id);

-- Step 3: Verify the sync
SELECT 
  u.email,
  u.stripe_customer_id,
  um.stripe_customer_id,
  um.stripe_subscription_id,
  mt.display_name as tier
FROM users u
JOIN user_memberships um ON um.user_id = u.id
JOIN membership_tiers mt ON mt.id = um.tier_id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY u.email;

-- Note: stripe_subscription_id will still be NULL until you complete a real Stripe checkout
-- For testing, you can manually add one if you have it:
-- UPDATE user_memberships 
-- SET stripe_subscription_id = 'sub_YOUR_TEST_SUBSCRIPTION_ID'
-- WHERE user_id = (SELECT id FROM users WHERE email = 'claytoncripe@live.com');

