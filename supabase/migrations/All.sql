-- =====================================================
-- LJ UNIVERSITY EVENT MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- =====================================================
-- RLS enabled with permissive policies for service_role access

-- =====================================================
-- 1. EXTENSIONS & ENUMS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE event_status AS ENUM ('draft', 'active', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE submission_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE judge_status AS ENUM ('pending', 'completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================================================
-- 2. DROP EXISTING TABLES
-- =====================================================

DROP TABLE IF EXISTS public.scores CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.team_judges CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.evaluation_criteria CASCADE;
DROP TABLE IF EXISTS public.judging_criteria CASCADE;
DROP TABLE IF EXISTS public.leaderboard CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.mentor_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar NOT NULL UNIQUE,
  full_name varchar NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url text,
  password_hash text NOT NULL,
  enrollment_number varchar,
  department varchar,
  theme varchar DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  venue varchar,
  status event_status DEFAULT 'draft',
  max_teams integer,
  registration_deadline date,
  total_teams integer DEFAULT 0,
  total_judges integer DEFAULT 0,
  total_submissions integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  evaluation_open boolean DEFAULT true,
  leaderboard_visible boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_name varchar NOT NULL,
  school_name varchar,
  team_size integer DEFAULT 0,
  total_score numeric DEFAULT 0,
  stall_no varchar,
  domain varchar,
  contact_email varchar,
  contact_phone varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role varchar DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE public.mentor_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company varchar,
  designation varchar,
  domain varchar,
  experience varchar,
  bank_name varchar,
  acc_no varchar,
  ifsc varchar,
  branch varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.evaluation_criteria (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  criteria_name varchar NOT NULL,
  description text,
  max_score numeric NOT NULL DEFAULT 100,
  weight numeric DEFAULT 1,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.judging_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  max_points integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.team_judges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status judge_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id, judge_id, event_id)
);

CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  criteria_id uuid NOT NULL REFERENCES public.evaluation_criteria(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_score CHECK (score >= 0)
);

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  submission_title varchar NOT NULL,
  submission_description text,
  submission_url text,
  file_url text,
  status submission_status DEFAULT 'submitted',
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  rank integer,
  total_score numeric,
  team_name varchar,
  school_name varchar,
  team_size integer,
  stall_no varchar,
  domain varchar,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, team_id)
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_teams_event_id ON public.teams(event_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_judges_judge_id ON public.team_judges(judge_id);
CREATE INDEX idx_scores_team_id ON public.scores(team_id);
CREATE INDEX idx_leaderboard_event_id ON public.leaderboard(event_id);

-- =====================================================
-- 5. ENABLE RLS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. DROP EXISTING POLICIES
-- =====================================================

DO $$ 
DECLARE pol record;
BEGIN
  FOR pol IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- =====================================================
-- 7. CREATE PERMISSIVE RLS POLICIES
-- =====================================================
-- Service role bypasses RLS automatically in Supabase
-- These policies allow all operations for service_role

CREATE POLICY "allow_service_role_all" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.events FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.teams FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.teams FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.teams FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.team_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.team_members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.mentor_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.mentor_profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.mentor_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.evaluation_criteria FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.evaluation_criteria FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.evaluation_criteria FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.judging_criteria FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.judging_criteria FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.judging_criteria FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.team_judges FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.team_judges FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.team_judges FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.scores FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all" ON public.leaderboard FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.leaderboard FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_all" ON public.leaderboard FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_event_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.events SET total_teams = (SELECT COUNT(*) FROM public.teams WHERE event_id = NEW.event_id), updated_at = now() WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events SET total_teams = (SELECT COUNT(*) FROM public.teams WHERE event_id = OLD.event_id), updated_at = now() WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION public.update_team_score()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.teams SET total_score = (SELECT COALESCE(SUM(score), 0) FROM public.scores WHERE team_id = NEW.team_id), updated_at = now() WHERE id = NEW.team_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.teams SET total_score = (SELECT COALESCE(SUM(score), 0) FROM public.scores WHERE team_id = OLD.team_id), updated_at = now() WHERE id = OLD.team_id;
  END IF;
  RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE v_event_id uuid;
BEGIN
  SELECT event_id INTO v_event_id FROM public.teams WHERE id = NEW.team_id;
  DELETE FROM public.leaderboard WHERE team_id = NEW.team_id AND event_id = v_event_id;
  INSERT INTO public.leaderboard (event_id, team_id, team_name, school_name, team_size, stall_no, domain, total_score, rank)
  SELECT t.event_id, t.id, t.team_name, t.school_name, t.team_size, t.stall_no, t.domain, t.total_score,
    ROW_NUMBER() OVER (PARTITION BY t.event_id ORDER BY t.total_score DESC) as rank
  FROM public.teams t WHERE t.id = NEW.team_id;
  RETURN NULL;
END; $$;

-- =====================================================
-- 10. CREATE TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_event_stats ON public.teams;
CREATE TRIGGER trigger_update_event_stats AFTER INSERT OR UPDATE OR DELETE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_event_stats();

DROP TRIGGER IF EXISTS trigger_update_team_score ON public.scores;
CREATE TRIGGER trigger_update_team_score AFTER INSERT OR UPDATE OR DELETE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.update_team_score();

DROP TRIGGER IF EXISTS trigger_update_leaderboard ON public.teams;
CREATE TRIGGER trigger_update_leaderboard AFTER UPDATE OF total_score ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_leaderboard();

-- =====================================================
-- 11. GRANT EXECUTE ON FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.update_event_stats() TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_team_score() TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_leaderboard() TO service_role, authenticated, anon;

-- =====================================================
-- SETUP COMPLETE - RLS ENABLED WITH PERMISSIVE POLICIES
-- =====================================================
