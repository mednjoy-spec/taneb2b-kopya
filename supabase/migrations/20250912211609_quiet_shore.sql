/*
  # Fix Profile Creation RLS Policy

  1. Security Changes
    - Drop existing problematic policies
    - Create new policy allowing authenticated users to insert their own profile
    - Ensure proper RLS configuration for profile creation during registration

  2. Policy Details
    - INSERT policy: Users can create profiles with their own auth.uid()
    - SELECT policy: Users can read their own profiles or admins can read all
    - UPDATE policy: Users can update their own profiles
*/

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all operations for admins" ON profiles;

-- Create new INSERT policy that allows users to create their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create SELECT policy for reading profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Create UPDATE policy for updating profiles
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create DELETE policy (admin only)
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );