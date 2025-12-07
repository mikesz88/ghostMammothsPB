-- Complete fix for all membership issues
-- Run this in Supabase SQL Editor

-- ============================================
-- ISSUE 1: Wrong tier_id in user_memberships
-- ============================================
-- Problem: user_memberships points to free tier, but users.membership_status says otherwise

-- See the problem
SELECT 
  u.email,
  u.membership_status as "users table says",
  mt.name as "user_memberships points to",
  mt.display_name as "tier display name",
  mt.price,
  CASE 
    WHEN u.membership_status != 'free' AND mt.name = 'free' 
    THEN '❌ MISMATCH - NEEDS FIX'
    ELSE '✅ OK'
  END as status
FROM users u
JOIN user_memberships um ON um.user_id = u.id
JOIN membership_tiers mt ON mt.id = um.tier_id
ORDER BY u.email;

-- Fix it: Update user_memberships.tier_id to match users.membership_status
UPDATE user_memberships um
SET 
  tier_id = mt_correct.id,
  updated_at = NOW()
FROM users u
JOIN membership_tiers mt_correct ON (
  mt_correct.name = u.membership_status 
  OR mt_correct.display_name = u.membership_status
)
WHERE um.user_id = u.id
  AND u.membership_status != 'free'
  AND um.tier_id != mt_correct.id;

-- ============================================
-- ISSUE 2: Missing stripe_customer_id
-- ============================================
-- Problem: stripe_customer_id is in users table but not in user_memberships

-- See the problem
SELECT 
  u.email,
  u.stripe_customer_id as "users table",
  um.stripe_customer_id as "user_memberships table",
  CASE 
    WHEN u.stripe_customer_id IS NOT NULL AND um.stripe_customer_id IS NULL 
    THEN '❌ NEEDS SYNC'
    ELSE '✅ OK'
  END as status
FROM users u
LEFT JOIN user_memberships um ON um.user_id = u.id
WHERE u.stripe_customer_id IS NOT NULL;

-- Fix it: Sync from users to user_memberships
UPDATE user_memberships um
SET 
  stripe_customer_id = u.stripe_customer_id,
  updated_at = NOW()
FROM users u
WHERE um.user_id = u.id
  AND u.stripe_customer_id IS NOT NULL
  AND (um.stripe_customer_id IS NULL OR um.stripe_customer_id != u.stripe_customer_id);

-- ============================================
-- ISSUE 3: Missing stripe_subscription_id
-- ============================================
-- Note: This can only be fixed by:
-- 1. Going through actual Stripe checkout, OR
-- 2. Manually adding the subscription ID if you have one from Stripe

-- To manually add (if you have subscription ID from Stripe dashboard):
-- UPDATE user_memberships 
-- SET stripe_subscription_id = 'sub_YOUR_SUBSCRIPTION_ID'
-- WHERE user_id = (SELECT id FROM users WHERE email = 'claytoncripe@live.com');

-- ============================================
-- VERIFY ALL FIXES WORKED
-- ============================================
SELECT 
  u.email,
  u.membership_status,
  mt.name as tier_name,
  mt.display_name as tier_display_name,
  mt.price,
  um.status,
  um.stripe_customer_id,
  um.stripe_subscription_id,
  CASE 
    WHEN mt.price > 0 AND um.stripe_customer_id IS NOT NULL THEN '✅ Can use billing portal'
    WHEN mt.price > 0 AND um.stripe_customer_id IS NULL THEN '❌ Missing customer ID'
    ELSE 'Free tier - no Stripe needed'
  END as billing_portal_status,
  CASE 
    WHEN mt.price > 0 AND um.stripe_subscription_id IS NOT NULL THEN '✅ Can cancel subscription'
    WHEN mt.price > 0 AND um.stripe_subscription_id IS NULL THEN '❌ Missing subscription ID'
    ELSE 'Free tier - no subscription'
  END as cancel_status
FROM users u
JOIN user_memberships um ON um.user_id = u.id
JOIN membership_tiers mt ON mt.id = um.tier_id
ORDER BY u.email;

-- ============================================
-- EXPECTED RESULT FOR PAID MEMBERS
-- ============================================
-- After running fixes, you should see:
-- ✅ tier_name matches users.membership_status
-- ✅ stripe_customer_id populated
-- ⚠️ stripe_subscription_id may still be NULL (need real Stripe checkout)

