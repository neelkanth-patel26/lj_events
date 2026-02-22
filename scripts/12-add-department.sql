-- Add department column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department character varying;
