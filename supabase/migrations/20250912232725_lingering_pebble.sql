/*
  # Fix RLS policies for suppliers

  1. Security Updates
    - Allow suppliers to create and manage their own categories
    - Fix product update policies for suppliers
    - Ensure proper permissions for CRUD operations

  2. Policy Changes
    - Categories: Allow suppliers to create categories
    - Products: Fix update permissions for suppliers
    - Maintain security while enabling functionality
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Suppliers can manage own products" ON products;
DROP POLICY IF EXISTS "Managers can manage categories" ON categories;

-- Create better product policies for suppliers
CREATE POLICY "Suppliers can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    supplier_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    supplier_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Create better category policies
CREATE POLICY "Suppliers can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'supplier')
    )
  );

CREATE POLICY "Suppliers can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'supplier')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'supplier')
    )
  );

CREATE POLICY "Suppliers can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'supplier')
    )
  );

-- Ensure profiles table has proper RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update profiles policies to be more permissive for reading roles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.id = auth.uid() 
      AND p2.role IN ('admin', 'manager')
    )
  );