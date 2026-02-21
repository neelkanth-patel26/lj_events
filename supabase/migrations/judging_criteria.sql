-- Create judging_criteria table if it doesn't exist
CREATE TABLE IF NOT EXISTS judging_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_judging_criteria_user_id ON judging_criteria(user_id);

-- Enable RLS
ALTER TABLE judging_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own criteria" ON judging_criteria
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own criteria" ON judging_criteria
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own criteria" ON judging_criteria
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own criteria" ON judging_criteria
  FOR DELETE USING (auth.uid() = user_id);
