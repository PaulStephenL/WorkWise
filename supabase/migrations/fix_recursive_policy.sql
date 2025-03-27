-- Fix for infinite recursion detected in policy for relation "profiles"

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Jobs are manageable by admin" ON jobs;
DROP POLICY IF EXISTS "Companies are manageable by admin" ON companies;
DROP POLICY IF EXISTS "Applications are manageable by admin" ON applications;

-- Step 2: Create a function to check admin status without triggering recursion
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- Directly query the profiles table without going through policies
  -- The SECURITY DEFINER ensures this runs with the privileges of the function creator
  SELECT role INTO user_role FROM public.profiles 
  WHERE id = user_id 
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the policies using the function
CREATE POLICY "Admins can manage all profiles"
ON public.profiles 
FOR ALL
TO authenticated
USING (
  public.check_is_admin(auth.uid())
);

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