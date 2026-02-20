-- Add password_hash column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing users with a default hash (they'll need to reset password)
UPDATE users SET password_hash = 'default' WHERE password_hash IS NULL;

-- Make password_hash NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
