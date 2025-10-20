-- Create DYNAMIC ADMIN TEST EVENT for easy testing
-- Run this in Supabase SQL Editor
-- Create the test event
INSERT INTO
  events (
    name,
    location,
    date,
    time,
    num_courts,
    court_count,
    team_size,
    rotation_type,
    status,
    price,
    free_for_members,
    max_participants,
    requires_membership
  )
VALUES
  (
    'DYNAMIC ADMIN TEST EVENT',
    'Test Facility',
    CURRENT_DATE,
    '14:00:00',
    '2',
    2,
    2,
    'winners-stay',
    'active',
    0.00,
    true,
    20,
    false
  ) ON CONFLICT DO NOTHING;

-- Verify the event was created
SELECT
  id,
  name,
  location,
  date,
  time,
  num_courts,
  court_count,
  team_size,
  rotation_type,
  status,
  price,
  free_for_members,
  max_participants,
  requires_membership
FROM
  events
WHERE
  name = 'DYNAMIC ADMIN TEST EVENT';