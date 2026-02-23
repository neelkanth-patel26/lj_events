-- Add unique constraint to prevent duplicate mentor-team assignments
ALTER TABLE team_judges 
ADD CONSTRAINT team_judges_team_judge_unique UNIQUE (team_id, judge_id);
