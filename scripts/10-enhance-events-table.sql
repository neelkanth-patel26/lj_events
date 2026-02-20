-- Add new columns to events table for enhanced event management
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS venue VARCHAR(255),
ADD COLUMN IF NOT EXISTS max_teams INTEGER,
ADD COLUMN IF NOT EXISTS registration_deadline DATE,
ADD COLUMN IF NOT EXISTS total_judges INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_submissions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0;

-- Add new columns to teams table for better organization
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS stall_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS domain VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Create function to update event statistics
CREATE OR REPLACE FUNCTION update_event_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total teams count
    UPDATE events 
    SET total_teams = (
        SELECT COUNT(*) 
        FROM teams 
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    -- Update total judges count
    UPDATE events 
    SET total_judges = (
        SELECT COUNT(DISTINCT judge_id) 
        FROM team_judges tj
        JOIN teams t ON tj.team_id = t.id
        WHERE t.event_id = COALESCE(NEW.event_id, OLD.event_id)
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    -- Update total submissions count
    UPDATE events 
    SET total_submissions = (
        SELECT COUNT(*) 
        FROM submissions 
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    -- Update completion rate
    UPDATE events 
    SET completion_rate = (
        SELECT CASE 
            WHEN COUNT(DISTINCT tj.team_id) = 0 THEN 0
            ELSE ROUND(
                (COUNT(DISTINCT CASE WHEN tj.status = 'completed' THEN tj.team_id END) * 100.0) / 
                COUNT(DISTINCT tj.team_id), 2
            )
        END
        FROM team_judges tj
        JOIN teams t ON tj.team_id = t.id
        WHERE t.event_id = COALESCE(NEW.event_id, OLD.event_id)
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update event statistics
DROP TRIGGER IF EXISTS update_event_stats_on_team_change ON teams;
CREATE TRIGGER update_event_stats_on_team_change
    AFTER INSERT OR UPDATE OR DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_event_stats();

DROP TRIGGER IF EXISTS update_event_stats_on_judge_change ON team_judges;
CREATE TRIGGER update_event_stats_on_judge_change
    AFTER INSERT OR UPDATE OR DELETE ON team_judges
    FOR EACH ROW EXECUTE FUNCTION update_event_stats();

DROP TRIGGER IF EXISTS update_event_stats_on_submission_change ON submissions;
CREATE TRIGGER update_event_stats_on_submission_change
    AFTER INSERT OR UPDATE OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_event_stats();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_registration_deadline ON events(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_teams_domain ON teams(domain);
CREATE INDEX IF NOT EXISTS idx_teams_stall_no ON teams(stall_no);