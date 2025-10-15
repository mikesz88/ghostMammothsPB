-- Add Stripe Price IDs to membership tiers
-- 
-- IMPORTANT: You need to create these Price IDs in your Stripe Dashboard first!
-- 
-- Steps:
-- 1. Go to https://dashboard.stripe.com/products
-- 2. Create a Product for each membership tier
-- 3. Add a recurring Price to each product (e.g., $35/month)
-- 4. Copy the Price ID (starts with "price_")
-- 5. Update the SQL below with your actual Stripe Price IDs
-- 6. Run this script in your Supabase SQL Editor

-- Example: Update monthly membership with Stripe Price ID
UPDATE membership_tiers 
SET stripe_price_id = 'price_REPLACE_WITH_YOUR_MONTHLY_PRICE_ID'
WHERE name = 'monthly';

-- If you have other paid tiers, add them here:
-- UPDATE membership_tiers 
-- SET stripe_price_id = 'price_REPLACE_WITH_YOUR_YEARLY_PRICE_ID'
-- WHERE name = 'yearly';

-- Verify the update
SELECT name, display_name, price, billing_period, stripe_price_id 
FROM membership_tiers 
WHERE price > 0;

-- Optional: Set stripe_price_id to NULL for free tier (should already be NULL)
UPDATE membership_tiers 
SET stripe_price_id = NULL
WHERE name = 'free' OR price = 0;

