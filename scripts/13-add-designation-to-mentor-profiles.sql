-- Add designation column to mentor_profiles table
ALTER TABLE public.mentor_profiles 
ADD COLUMN IF NOT EXISTS designation character varying;
