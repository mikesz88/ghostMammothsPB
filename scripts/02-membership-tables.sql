-- Membership system tables for Ghost Mammoths PB

-- Membership tiers (Free vs Paid)
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'monthly'
  display_name TEXT NOT NULL, -- 'Free Member', 'Monthly Member'
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'one-time', 'free'
  stripe_price_id TEXT, -- Stripe Price ID for recurring billing
  features JSONB DEFAULT '{}', -- Store feature flags as JSON
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default membership tiers
INSERT INTO membership_tiers (name, display_name, description, price, billing_period, features, sort_order) VALUES
('free', 'Free Member', 'Basic access to events', 0, 'free', 
 '{"event_access": "pay_per_event", "priority_queue": false, "exclusive_events": false}'::jsonb, 1),
('monthly', 'Monthly Member', 'Unlimited event access with monthly subscription', 35.00, 'monthly',
 '{"event_access": "unlimited", "priority_queue": true, "exclusive_events": true, "merchandise_discount": 10}'::jsonb, 2)
ON CONFLICT (name) DO NOTHING;

-- User memberships
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tier_id UUID REFERENCES membership_tiers(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due', 'trialing'
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add membership columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'free'; -- 'free', 'active', 'cancelled', 'expired'

-- Update events table for pricing
ALTER TABLE events ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS free_for_members BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS requires_membership BOOLEAN DEFAULT FALSE;

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_type TEXT NOT NULL, -- 'membership', 'event', 'product', 'refund'
  payment_method TEXT, -- 'card', 'cash', 'other'
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded', 'cancelled'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event registrations (track who joined which event)
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'attended', 'no_show', 'cancelled'
  payment_required BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'not_required', -- 'not_required', 'pending', 'paid', 'refunded'
  checked_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_customer ON user_memberships(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);

-- RLS Policies for membership tables

-- Membership tiers are viewable by everyone
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membership tiers are viewable by everyone" ON membership_tiers
  FOR SELECT USING (true);

-- Users can view their own membership
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own membership" ON user_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own event registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Event registrations are viewable by everyone (to see who's attending)
CREATE POLICY "Event registrations are viewable by everyone" ON event_registrations
  FOR SELECT USING (true);

-- Function to automatically create free membership for new users
CREATE OR REPLACE FUNCTION create_default_membership()
RETURNS TRIGGER AS $$
DECLARE
  free_tier_id UUID;
BEGIN
  -- Get the free tier ID
  SELECT id INTO free_tier_id FROM membership_tiers WHERE name = 'free' LIMIT 1;
  
  -- Create membership record
  IF free_tier_id IS NOT NULL THEN
    INSERT INTO user_memberships (user_id, tier_id, status)
    VALUES (NEW.id, free_tier_id, 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default membership when user is created
DROP TRIGGER IF EXISTS create_user_membership ON users;
CREATE TRIGGER create_user_membership
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_membership();

-- Function to check if user can join event
CREATE OR REPLACE FUNCTION can_user_join_event(p_user_id UUID, p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_event_price DECIMAL;
  v_free_for_members BOOLEAN;
  v_requires_membership BOOLEAN;
  v_user_membership_status TEXT;
  v_has_paid BOOLEAN;
BEGIN
  -- Get event details
  SELECT price, free_for_members, requires_membership
  INTO v_event_price, v_free_for_members, v_requires_membership
  FROM events
  WHERE id = p_event_id;
  
  -- Get user membership status
  SELECT um.status INTO v_user_membership_status
  FROM user_memberships um
  JOIN membership_tiers mt ON um.tier_id = mt.id
  WHERE um.user_id = p_user_id
  AND mt.name = 'monthly';
  
  -- Check if user has paid for this specific event
  SELECT EXISTS(
    SELECT 1 FROM event_registrations
    WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND payment_status IN ('paid', 'not_required')
  ) INTO v_has_paid;
  
  -- Logic:
  -- 1. If event is free (price = 0), anyone can join
  IF v_event_price = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- 2. If event requires membership and user doesn't have active membership
  IF v_requires_membership AND (v_user_membership_status IS NULL OR v_user_membership_status != 'active') THEN
    RETURN FALSE;
  END IF;
  
  -- 3. If event is free for members and user has active membership
  IF v_free_for_members AND v_user_membership_status = 'active' THEN
    RETURN TRUE;
  END IF;
  
  -- 4. If user has already paid for this event
  IF v_has_paid THEN
    RETURN TRUE;
  END IF;
  
  -- 5. Otherwise, payment is required
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE membership_tiers IS 'Defines membership plans (free, monthly, etc.)';
COMMENT ON TABLE user_memberships IS 'Tracks user membership status and Stripe subscription info';
COMMENT ON TABLE payments IS 'Records all payment transactions';
COMMENT ON TABLE event_registrations IS 'Tracks which users registered/attended which events';
COMMENT ON FUNCTION can_user_join_event IS 'Checks if a user is allowed to join an event based on membership and payment status';

