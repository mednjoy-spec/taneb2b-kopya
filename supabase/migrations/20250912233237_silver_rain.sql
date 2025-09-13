/*
  # Rebuild profiles table policies to fix infinite recursion

  1. Security Changes
    - Drop all existing policies on profiles table
    - Create new non-recursive policies
    - Use auth.uid() and auth.jwt() instead of profiles table references
    - Ensure no policy references profiles table within itself

  2. New Policy Structure
    - Simple ownership-based access for users
    - Direct auth metadata checks for admin access
    - No recursive queries or subselects on profiles table
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies using auth metadata (no profiles table reference)
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager' OR
    auth.uid() = id
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager'
  );

-- Update other table policies to avoid profiles table references
-- Fix campaigns policies
DROP POLICY IF EXISTS "Managers can manage campaigns" ON campaigns;
CREATE POLICY "Managers can manage campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager'
  );

-- Fix products policies
DROP POLICY IF EXISTS "Suppliers can manage own products" ON products;
CREATE POLICY "Suppliers can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    supplier_id = auth.uid() OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager'
  )
  WITH CHECK (
    supplier_id = auth.uid() OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager'
  );

-- Fix categories policies
DROP POLICY IF EXISTS "Suppliers can create categories" ON categories;
DROP POLICY IF EXISTS "Suppliers can update categories" ON categories;
DROP POLICY IF EXISTS "Suppliers can delete categories" ON categories;

CREATE POLICY "Suppliers can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager' OR
    (auth.jwt() ->> 'role') = 'supplier'
  );

CREATE POLICY "Suppliers can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager' OR
    (auth.jwt() ->> 'role') = 'supplier'
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager' OR
    (auth.jwt() ->> 'role') = 'supplier'
  );

CREATE POLICY "Suppliers can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager' OR
    (auth.jwt() ->> 'role') = 'supplier'
  );

-- Fix orders policies
DROP POLICY IF EXISTS "Suppliers and managers can update orders" ON orders;
CREATE POLICY "Suppliers and managers can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    supplier_id = auth.uid() OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager'
  );

DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    supplier_id = auth.uid() OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'manager'
  );