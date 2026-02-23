-- Add theme preference column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light';

-- Update existing users to have light theme
UPDATE public.users 
SET theme = 'light' 
WHERE theme IS NULL;
