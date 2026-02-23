-- Add event_id to team_judges table
ALTER TABLE team_judges 
ADD COLUMN event_id uuid REFERENCES events(id);

-- Update existing records to set event_id from teams
UPDATE team_judges 
SET event_id = teams.event_id 
FROM teams 
WHERE team_judges.team_id = teams.id;

-- Make event_id NOT NULL after populating
ALTER TABLE team_judges 
ALTER COLUMN event_id SET NOT NULL;

-- Update unique constraint to include event_id
ALTER TABLE team_judges 
DROP CONSTRAINT IF EXISTS team_judges_team_judge_unique;

ALTER TABLE team_judges 
ADD CONSTRAINT team_judges_team_judge_unique UNIQUE (team_id, judge_id, event_id);
