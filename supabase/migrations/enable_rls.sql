-- Disable Row Level Security on all tables
-- The application uses service role key for security through API routes
-- This prevents infinite recursion and policy conflicts

-- Disable RLS on all tables
ALTER TABLE public.evaluation_criteria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_criteria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_judges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies to clean up
DROP POLICY IF EXISTS "Admins can manage evaluation criteria" ON public.evaluation_criteria;
DROP POLICY IF EXISTS "Everyone can view evaluation criteria" ON public.evaluation_criteria;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own criteria" ON public.judging_criteria;
DROP POLICY IF EXISTS "Users can insert their own criteria" ON public.judging_criteria;
DROP POLICY IF EXISTS "Users can update their own criteria" ON public.judging_criteria;
DROP POLICY IF EXISTS "Users can view their own criteria" ON public.judging_criteria;
DROP POLICY IF EXISTS "Everyone can view leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow admins to view all mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow service role full access to mentor_profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow users to update their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow users to view their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Admins can view all scores" ON public.scores;
DROP POLICY IF EXISTS "Judges can insert their own scores" ON public.scores;
DROP POLICY IF EXISTS "Judges can update their own scores" ON public.scores;
DROP POLICY IF EXISTS "Judges can view their own scores" ON public.scores;
DROP POLICY IF EXISTS "Teams can insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teams can view their submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage judge assignments" ON public.team_judges;
DROP POLICY IF EXISTS "Mentors can view their assignments" ON public.team_judges;
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Students can view their team" ON public.team_members;
DROP POLICY IF EXISTS "Admins can create teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view teams in active events" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Fix function search_path security issue
ALTER FUNCTION public.update_event_stats() SET search_path = public, pg_temp;
