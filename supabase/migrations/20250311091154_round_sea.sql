/*
  # WorkWise Database Schema

  1. Tables
    - companies: Store company information
    - company_admins: Link companies with admin users
    - jobs: Store job listings
    - applications: Track job applications
    - profiles: Link with auth.users and store additional user data

  2. Security
    - Enable RLS on all tables
    - Add policies for public access, authenticated users, and admins

  3. Note: Users must be created through Supabase Auth first
    - The profiles table will be populated when users sign up through the auth system
*/

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create company_admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_admins (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, company_id)
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location text NOT NULL,
  type text NOT NULL,
  qualifications text[] NOT NULL DEFAULT '{}',
  salary_range text,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  cover_letter text,
  resume_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  resume_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Companies are manageable by admin" ON companies;
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Jobs are manageable by admin" ON jobs;
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can create applications" ON applications;
DROP POLICY IF EXISTS "Applications are manageable by admin" ON applications;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can select profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Companies are viewable by everyone" 
  ON companies FOR SELECT 
  TO public, authenticated
  USING (true);

CREATE POLICY "Companies are manageable by admin" 
  ON companies FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Jobs are viewable by everyone" 
  ON jobs FOR SELECT 
  TO public, authenticated
  USING (true);

CREATE POLICY "Jobs are manageable by admin" 
  ON jobs FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own applications" 
  ON applications FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" 
  ON applications FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applications are manageable by admin" 
  ON applications FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
  );

-- Profile policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert any profile"
  ON public.profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Public can select profiles"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON companies TO anon, authenticated;
GRANT SELECT ON jobs TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON applications TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Grant additional permissions for joins
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Insert sample companies if none exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM companies LIMIT 1) THEN
    INSERT INTO companies (name, description, logo_url, location) VALUES
      ('TechCorp', 'Leading technology solutions provider', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623', 'San Francisco, CA'),
      ('DesignHub', 'Creative design agency', 'https://images.unsplash.com/photo-1560179707-f14e90ef3624', 'New York, NY'),
      ('DataFlow', 'Data analytics company', 'https://images.unsplash.com/photo-1560179707-f14e90ef3625', 'Boston, MA');
  END IF;

  -- Insert sample jobs if none exist
  IF NOT EXISTS (SELECT 1 FROM jobs LIMIT 1) THEN
    INSERT INTO jobs (title, description, company_id, location, type, qualifications, salary_range, deadline)
    SELECT
      'Senior Frontend Developer',
      'We are looking for an experienced frontend developer to join our team.',
      id,
      'San Francisco, CA',
      'Full-time',
      ARRAY['5+ years React experience', 'Strong TypeScript skills', 'Experience with modern frontend tools'],
      '$120,000 - $180,000',
      now() + interval '30 days'
    FROM companies WHERE name = 'TechCorp';

    INSERT INTO jobs (title, description, company_id, location, type, qualifications, salary_range, deadline)
    SELECT
      'UI/UX Designer',
      'Join our creative team as a UI/UX designer.',
      id,
      'New York, NY',
      'Full-time',
      ARRAY['3+ years design experience', 'Proficiency in Figma', 'Strong portfolio'],
      '$90,000 - $140,000',
      now() + interval '30 days'
    FROM companies WHERE name = 'DesignHub';

    INSERT INTO jobs (title, description, company_id, location, type, qualifications, salary_range, deadline)
    SELECT
      'Data Scientist',
      'Looking for a data scientist to help analyze and interpret complex data sets.',
      id,
      'Boston, MA',
      'Full-time',
      ARRAY['MS/PhD in related field', 'Python expertise', 'Machine learning experience'],
      '$130,000 - $190,000',
      now() + interval '30 days'
    FROM companies WHERE name = 'DataFlow';
  END IF;
END $$;

-- Insert trigger to create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the server-side function for profile creation
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'user'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if the profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    SELECT jsonb_build_object(
      'id', id,
      'name', name,
      'email', email,
      'role', role
    ) INTO result
    FROM profiles
    WHERE id = user_id;
    
    RETURN result;
  END IF;

  -- Insert the new profile
  INSERT INTO profiles (id, name, email, role)
  VALUES (user_id, user_name, user_email, user_role)
  RETURNING jsonb_build_object(
    'id', id,
    'name', name,
    'email', email,
    'role', role
  ) INTO result;
  
  RETURN result;
END;
$$;