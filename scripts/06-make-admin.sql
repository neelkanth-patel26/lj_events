-- Make current authenticated user an admin
-- Run this after signing up with your account
-- Replace YOUR_EMAIL with your actual email

INSERT INTO users (id, email, full_name, role)
VALUES (
  auth.uid(),
  'YOUR_EMAIL@example.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
