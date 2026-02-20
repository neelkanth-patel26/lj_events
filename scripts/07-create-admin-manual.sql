-- Manual admin creation (run in Supabase SQL Editor)
-- This bypasses email confirmation and rate limits

-- Step 1: Get your auth user ID
-- Go to Authentication > Users in Supabase dashboard
-- Copy your user ID

-- Step 2: Run this (replace YOUR_USER_ID, YOUR_EMAIL, YOUR_NAME)
INSERT INTO users (id, email, full_name, role)
VALUES (
  'YOUR_USER_ID'::uuid,
  'YOUR_EMAIL@example.com',
  'YOUR_NAME',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
