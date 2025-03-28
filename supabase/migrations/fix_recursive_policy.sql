-- Fix for infinite recursion detected in policy for relation "profiles"

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Jobs are manageable by admin" ON jobs;
DROP POLICY IF EXISTS "Companies are manageable by admin" ON companies;
DROP POLICY IF EXISTS "Applications are manageable by admin" ON applications;

-- Step 2: Create a function to safely check if a user is admin (without recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Run with creator's permissions
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Direct query that bypasses RLS
  SELECT (role = 'admin') INTO is_admin FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(is_admin, false);
END;
$$;

-- Step 3: Recreate the policies using the function
CREATE POLICY "Admins can manage all profiles"
ON public.profiles 
FOR ALL
TO authenticated
USING (check_is_admin(auth.uid()));

CREATE POLICY "Jobs are manageable by admin" 
ON jobs FOR ALL 
TO authenticated 
USING (
  public.check_is_admin(auth.uid())
);

CREATE POLICY "Companies are manageable by admin" 
ON companies FOR ALL 
TO authenticated 
USING (
  public.check_is_admin(auth.uid())
);

CREATE POLICY "Applications are manageable by admin" 
ON applications FOR ALL 
TO authenticated 
USING (
  public.check_is_admin(auth.uid())
);

-- Insert a profile for your user ID to make them an admin
INSERT INTO public.profiles (id, name, email, role)
VALUES ('2a5f9b57-ceb4-4c13-b618-e440598fa385', 'Admin User', 'your_email@example.com', 'admin')
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now(); 