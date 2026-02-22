-- Enable RLS on mentor_profiles if not already enabled
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access to mentor_profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow users to view their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow users to update their own mentor profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Allow admins to view all mentor profiles" ON public.mentor_profiles;

-- Allow service role (admin client) full access
CREATE POLICY "Allow service role full access to mentor_profiles"
ON public.mentor_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow admins to view all mentor profiles
CREATE POLICY "Allow admins to view all mentor profiles"
ON public.mentor_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow users to view their own profile
CREATE POLICY "Allow users to view their own mentor profile"
ON public.mentor_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert/update their own profile
CREATE POLICY "Allow users to update their own mentor profile"
ON public.mentor_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
