-- Create mentor_profiles table
CREATE TABLE IF NOT EXISTS mentor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255),
  domain VARCHAR(100),
  experience VARCHAR(50),
  bank_name VARCHAR(255),
  acc_no VARCHAR(50),
  ifsc VARCHAR(50),
  branch VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON mentor_profiles FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all profiles"
  ON mentor_profiles FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON mentor_profiles FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON mentor_profiles FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE role = 'admin'
    )
  );
