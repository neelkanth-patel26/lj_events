-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.evaluation_criteria (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  criteria_name character varying NOT NULL,
  description text,
  max_score numeric NOT NULL DEFAULT 100,
  weight numeric DEFAULT 1,
  display_order integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_criteria_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_criteria_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  event_date date NOT NULL,
  status USER-DEFINED DEFAULT 'draft'::event_status,
  total_teams integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  start_time time without time zone,
  end_time time without time zone,
  venue character varying,
  max_teams integer,
  registration_deadline date,
  total_judges integer DEFAULT 0,
  total_submissions integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  evaluation_open boolean DEFAULT true,
  leaderboard_visible boolean DEFAULT false,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.judging_criteria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  max_points integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT judging_criteria_pkey PRIMARY KEY (id),
  CONSTRAINT judging_criteria_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.leaderboard (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  team_id uuid NOT NULL,
  rank integer,
  total_score numeric,
  team_name character varying,
  school_name character varying,
  team_size integer,
  updated_at timestamp with time zone DEFAULT now(),
  stall_no character varying,
  domain character varying,
  CONSTRAINT leaderboard_pkey PRIMARY KEY (id),
  CONSTRAINT leaderboard_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT leaderboard_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.mentor_profiles (
  user_id uuid NOT NULL,
  company character varying,
  domain character varying,
  experience character varying,
  bank_name character varying,
  acc_no character varying,
  ifsc character varying,
  branch character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  designation character varying,
  CONSTRAINT mentor_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT mentor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.scores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  judge_id uuid NOT NULL,
  criteria_id uuid NOT NULL,
  score numeric NOT NULL,
  feedback text,
  submitted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scores_pkey PRIMARY KEY (id),
  CONSTRAINT scores_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT scores_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.users(id),
  CONSTRAINT scores_criteria_id_fkey FOREIGN KEY (criteria_id) REFERENCES public.evaluation_criteria(id)
);
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  event_id uuid NOT NULL,
  submission_title character varying NOT NULL,
  submission_description text,
  submission_url text,
  file_url text,
  status USER-DEFINED DEFAULT 'submitted'::submission_status,
  submitted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT submissions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.team_judges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  judge_id uuid NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::judge_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  event_id uuid NOT NULL,
  CONSTRAINT team_judges_pkey PRIMARY KEY (id),
  CONSTRAINT team_judges_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_judges_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.users(id),
  CONSTRAINT team_judges_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying DEFAULT 'member'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  team_name character varying NOT NULL,
  school_name character varying,
  team_size integer DEFAULT 0,
  total_score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  stall_no character varying,
  domain character varying,
  contact_email character varying,
  contact_phone character varying,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  password_hash text NOT NULL,
  enrollment_number character varying,
  department character varying,
  theme character varying DEFAULT 'light'::character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);