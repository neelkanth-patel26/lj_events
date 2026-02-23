-- Add theme column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'theme'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN theme character varying DEFAULT 'light'::character varying;
  END IF;
END $$;
