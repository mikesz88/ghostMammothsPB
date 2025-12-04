-- Debug script: Check membership data to diagnose UI issues
-- Run this in Supabase SQL Editor to see what's in your database

-- 1. Check what membership tiers exist
SELECT 
  name as tier_name,
  display_name,
  price,
  billing_period,
  is_active,
  stripe_price_id,
  sort_order
FROM membership_tiers
ORDER BY sort_order;

-- 2. Check user_memberships table (what getUserMembership reads)
SELECT 
  um.user_id,
  u.email,
  u.name as user_name,
  um.status,
  mt.name as tier_name,
  mt.display_name as tier_display_name,
  mt.price as tier_price,
  um.current_period_end,
  um.cancel_at_period_end
FROM user_memberships um
JOIN users u ON u.id = um.user_id
JOIN membership_tiers mt ON mt.id = um.tier_id
ORDER BY u.email;

-- 3. Check users.membership_status field (legacy field)
SELECT 
  email,
  name,
  membership_status,
  stripe_customer_id
FROM users
WHERE membership_status != 'free' OR stripe_customer_id IS NOT NULL
ORDER BY email;

-- 4. Check if there's a mismatch between tables
SELECT 
  u.email,
  u.name,
  u.membership_status as users_table_status,
  mt.name as user_memberships_tier_name,
  mt.display_name as user_memberships_tier_display
FROM users u
LEFT JOIN user_memberships um ON um.user_id = u.id
LEFT JOIN membership_tiers mt ON mt.id = um.tier_id
WHERE u.stripe_customer_id IS NOT NULL
ORDER BY u.email;

