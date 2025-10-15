-- Fix user_memberships records that point to wrong tier
-- 
-- Issue: user_memberships.tier_id points to free tier, but users.membership_status 
-- shows they have a paid membership
--
-- Run this in Supabase SQL Editor

-- Step 1: See which users have mismatched tiers
SELECT 
  u.id as user_id,
  u.email,
  u.membership_status as users_table_says,
  mt_current.name as user_memberships_points_to,
  mt_current.display_name as current_tier_display,
  mt_correct.id as correct_tier_id,
  mt_correct.name as should_be_tier
FROM users u
JOIN user_memberships um ON um.user_id = u.id
JOIN membership_tiers mt_current ON mt_current.id = um.tier_id
LEFT JOIN membership_tiers mt_correct ON (
  mt_correct.name = u.membership_status 
  OR mt_correct.display_name = u.membership_status
)
WHERE u.membership_status != 'free' 
  AND mt_current.name = 'free'
  AND mt_correct.id IS NOT NULL;

-- Step 2: Fix them automatically
UPDATE user_memberships
SET 
  tier_id = mt_correct.id,
  updated_at = NOW()
FROM users u
JOIN membership_tiers mt_correct ON (
  mt_correct.name = u.membership_status 
  OR mt_correct.display_name = u.membership_status
)
WHERE user_memberships.user_id = u.id
  AND u.membership_status != 'free'
  AND mt_correct.price > 0
  AND user_memberships.tier_id IN (
    SELECT id FROM membership_tiers WHERE name = 'free'
  );

-- Step 3: Verify the fix
SELECT 
  u.email,
  u.membership_status,
  mt.name as tier_name,
  mt.display_name as tier_display_name,
  mt.price,
  um.status
FROM users u
JOIN user_memberships um ON um.user_id = u.id
JOIN membership_tiers mt ON mt.id = um.tier_id
WHERE u.email = 'claytoncripe@live.com';

