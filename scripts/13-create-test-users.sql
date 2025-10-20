-- Create 20 test/dummy users for testing game flows
-- Run this in Supabase SQL Editor

-- Create test users (only if they don't exist)
INSERT INTO users (id, email, name, phone, skill_level, is_admin, membership_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test01@demo.com', 'Alice Demo', '(555) 000-0001', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000002', 'test02@demo.com', 'Bob Demo', '(555) 000-0002', 'advanced', false, 'free'),
  ('00000000-0000-0000-0000-000000000003', 'test03@demo.com', 'Charlie Demo', '(555) 000-0003', 'beginner', false, 'free'),
  ('00000000-0000-0000-0000-000000000004', 'test04@demo.com', 'Diana Demo', '(555) 000-0004', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000005', 'test05@demo.com', 'Eve Demo', '(555) 000-0005', 'pro', false, 'free'),
  ('00000000-0000-0000-0000-000000000006', 'test06@demo.com', 'Frank Demo', '(555) 000-0006', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000007', 'test07@demo.com', 'Grace Demo', '(555) 000-0007', 'advanced', false, 'free'),
  ('00000000-0000-0000-0000-000000000008', 'test08@demo.com', 'Henry Demo', '(555) 000-0008', 'beginner', false, 'free'),
  ('00000000-0000-0000-0000-000000000009', 'test09@demo.com', 'Iris Demo', '(555) 000-0009', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000010', 'test10@demo.com', 'Jack Demo', '(555) 000-0010', 'advanced', false, 'free'),
  ('00000000-0000-0000-0000-000000000011', 'test11@demo.com', 'Kate Demo', '(555) 000-0011', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000012', 'test12@demo.com', 'Leo Demo', '(555) 000-0012', 'pro', false, 'free'),
  ('00000000-0000-0000-0000-000000000013', 'test13@demo.com', 'Maya Demo', '(555) 000-0013', 'beginner', false, 'free'),
  ('00000000-0000-0000-0000-000000000014', 'test14@demo.com', 'Noah Demo', '(555) 000-0014', 'advanced', false, 'free'),
  ('00000000-0000-0000-0000-000000000015', 'test15@demo.com', 'Olivia Demo', '(555) 000-0015', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000016', 'test16@demo.com', 'Paul Demo', '(555) 000-0016', 'intermediate', false, 'free'),
  ('00000000-0000-0000-0000-000000000017', 'test17@demo.com', 'Quinn Demo', '(555) 000-0017', 'advanced', false, 'free'),
  ('00000000-0000-0000-0000-000000000018', 'test18@demo.com', 'Rachel Demo', '(555) 000-0018', 'beginner', false, 'free'),
  ('00000000-0000-0000-0000-000000000019', 'test19@demo.com', 'Sam Demo', '(555) 000-0019', 'pro', false, 'free'),
  ('00000000-0000-0000-0000-000000000020', 'test20@demo.com', 'Tina Demo', '(555) 000-0020', 'intermediate', false, 'free')
ON CONFLICT (id) DO NOTHING;

-- Verify test users were created
SELECT
  id,
  name,
  email,
  phone,
  skill_level,
  membership_status
FROM
  users
WHERE
  id::text LIKE '00000000-0000-0000-0000-000000000%'
ORDER BY
  id;