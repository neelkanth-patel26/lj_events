-- Add evaluation_open column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS evaluation_open boolean DEFAULT true;

-- Update existing events to have evaluation open
UPDATE public.events SET evaluation_open = true WHERE evaluation_open IS NULL;
