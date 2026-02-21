-- Add enrollment_number column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS enrollment_number VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_enrollment_number ON users(enrollment_number);
