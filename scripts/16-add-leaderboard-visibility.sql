-- Add leaderboard_visible column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS leaderboard_visible boolean DEFAULT false;

-- Update existing events to have leaderboard hidden by default
UPDATE public.events SET leaderboard_visible = false WHERE leaderboard_visible IS NULL;
