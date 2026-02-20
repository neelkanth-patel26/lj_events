import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...');
    
    // Execute the SQL schema
    const { data, error } = await supabase.sql`
      -- Enable required extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create ENUM types
      CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'mentor', 'student');
      CREATE TYPE IF NOT EXISTS event_status AS ENUM ('draft', 'active', 'completed', 'archived');
      CREATE TYPE IF NOT EXISTS submission_status AS ENUM ('submitted', 'evaluated', 'approved', 'rejected');
      CREATE TYPE IF NOT EXISTS judge_status AS ENUM ('pending', 'in_progress', 'completed');

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'student',
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Events table
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        status event_status DEFAULT 'draft',
        total_teams INTEGER DEFAULT 0,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Teams/Groups table
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        team_name VARCHAR(255) NOT NULL,
        school_name VARCHAR(255),
        team_size INTEGER DEFAULT 0,
        total_score DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(event_id, team_name)
      );

      -- Team members (students in a team)
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(team_id, user_id)
      );

      -- Mentors/Judges assignment
      CREATE TABLE IF NOT EXISTS team_judges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        judge_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status judge_status DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(team_id, judge_id)
      );

      -- Criteria for evaluation
      CREATE TABLE IF NOT EXISTS evaluation_criteria (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        criteria_name VARCHAR(255) NOT NULL,
        description TEXT,
        max_score DECIMAL(10, 2) NOT NULL DEFAULT 100,
        weight DECIMAL(5, 2) DEFAULT 1,
        display_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Submissions (projects/work submitted by teams)
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        submission_title VARCHAR(255) NOT NULL,
        submission_description TEXT,
        submission_url TEXT,
        file_url TEXT,
        status submission_status DEFAULT 'submitted',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Scores/Evaluations
      CREATE TABLE IF NOT EXISTS scores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        judge_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        criteria_id UUID NOT NULL REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
        score DECIMAL(10, 2) NOT NULL,
        feedback TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(team_id, judge_id, criteria_id)
      );

      -- Leaderboard view
      CREATE TABLE IF NOT EXISTS leaderboard (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        rank INTEGER,
        total_score DECIMAL(10, 2),
        team_name VARCHAR(255),
        school_name VARCHAR(255),
        team_size INTEGER,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(event_id, team_id)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_judges_judge_id ON team_judges(judge_id);
      CREATE INDEX IF NOT EXISTS idx_scores_judge_id ON scores(judge_id);
      CREATE INDEX IF NOT EXISTS idx_scores_criteria_id ON scores(criteria_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
      CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_event_id ON evaluation_criteria(event_id);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_event_id ON leaderboard(event_id);
    `;

    if (error) {
      console.error('[v0] Database setup error:', error);
      process.exit(1);
    }

    console.log('[v0] Database schema created successfully');
  } catch (error) {
    console.error('[v0] Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
