/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Current policies on profiles table create infinite recursion
    - Policies reference profiles table within their own conditions
    - This causes "infinite recursion detected in policy" error

  2. Solution
    - Remove recursive policy references
    - Use only auth.uid() and direct conditions
    - Simplify policy logic to avoid self-references

  3. Changes
    - Drop existing problematic policies
    - Create new non-recursive policies
    - Ensure proper access control without loops
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Keep existing non-problematic policies
-- "Users can insert own profile" - already correct
-- "Users can update own profile" - already correct