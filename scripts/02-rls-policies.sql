-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leaderboard ENABLE ROW LEVEL SECURITY;

-- 1. DROP ALL POLICIES FIRST (Strict Idempotency)
DO $$ 
BEGIN
    -- Users
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "Admins can manage all users" ON users;

    -- Events
    DROP POLICY IF EXISTS "Admins can create events" ON events;
    DROP POLICY IF EXISTS "Admins can update events" ON events;
    DROP POLICY IF EXISTS "Admins can delete events" ON events;
    DROP POLICY IF EXISTS "Everyone can view active events" ON events;

    -- Teams
    DROP POLICY IF EXISTS "Users can view teams in active events" ON teams;
    DROP POLICY IF EXISTS "Admins can create teams" ON teams;
    DROP POLICY IF EXISTS "Admins can update teams" ON teams;

    -- Team Members
    DROP POLICY IF EXISTS "Students can view their team" ON team_members;
    DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;

    -- Criteria
    DROP POLICY IF EXISTS "Everyone can view evaluation criteria" ON evaluation_criteria;
    DROP POLICY IF EXISTS "Admins can manage evaluation criteria" ON evaluation_criteria;

    -- Submissions
    DROP POLICY IF EXISTS "Teams can view their submissions" ON submissions;
    DROP POLICY IF EXISTS "Teams can insert submissions" ON submissions;

    -- Leaderboard
    DROP POLICY IF EXISTS "Everyone can view leaderboard" ON leaderboard;

    -- Scores
    DROP POLICY IF EXISTS "Judges can view their own scores" ON scores;
    DROP POLICY IF EXISTS "Judges can insert their own scores" ON scores;
    DROP POLICY IF EXISTS "Judges can update their own scores" ON scores;
    DROP POLICY IF EXISTS "Admins can view all scores" ON scores;

    -- Assignments
    DROP POLICY IF EXISTS "Mentors can view their assignments" ON team_judges;
    DROP POLICY IF EXISTS "Admins can manage judge assignments" ON team_judges;
END $$;

-- 2. CREATE POLICIES

-- Users
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));

-- Events
CREATE POLICY "Admins can create events" ON events FOR INSERT WITH CHECK (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Everyone can view active events" ON events FOR SELECT USING (status = 'active' OR auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));

-- Teams
CREATE POLICY "Users can view teams in active events" ON teams FOR SELECT USING (event_id IN (SELECT id FROM events WHERE status = 'active') OR auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Admins can create teams" ON teams FOR INSERT WITH CHECK (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Admins can update teams" ON teams FOR UPDATE USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));

-- Team members
CREATE POLICY "Students can view their team" ON team_members FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));

-- Evaluation criteria
CREATE POLICY "Everyone can view evaluation criteria" ON evaluation_criteria FOR SELECT USING (true);
CREATE POLICY "Admins can manage evaluation criteria" ON evaluation_criteria FOR ALL USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));

-- Submissions
CREATE POLICY "Teams can view their submissions" ON submissions FOR SELECT USING (team_id IN (SELECT id FROM teams WHERE id IN (SELECT team_id FROM team_members WHERE user_id::text = auth.uid()::text)) OR auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
CREATE POLICY "Teams can insert submissions" ON submissions FOR INSERT WITH CHECK (team_id IN (SELECT id FROM teams WHERE id IN (SELECT team_id FROM team_members WHERE user_id::text = auth.uid()::text)));

-- Leaderboard
CREATE POLICY "Everyone can view leaderboard" ON leaderboard FOR SELECT USING (true);

-- Scores
CREATE POLICY "Judges can view their own scores" ON scores FOR SELECT USING (judge_id::text = auth.uid()::text);
CREATE POLICY "Judges can insert their own scores" ON scores FOR INSERT WITH CHECK (judge_id::text = auth.uid()::text);
CREATE POLICY "Judges can update their own scores" ON scores FOR UPDATE USING (judge_id::text = auth.uid()::text);
CREATE POLICY "Admins can view all scores" ON scores FOR SELECT USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));

-- Team judges
CREATE POLICY "Mentors can view their assignments" ON team_judges FOR SELECT USING (judge_id::text = auth.uid()::text);
CREATE POLICY "Admins can manage judge assignments" ON team_judges FOR ALL USING (auth.uid()::text IN (SELECT id::text FROM users WHERE role = 'admin'));
