-- Add stall_no and domain to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stall_no VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS domain VARCHAR(100);

-- Update leaderboard if it exists as a table
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS stall_no VARCHAR(50);
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS domain VARCHAR(100);
