/*
  # Create Customer and Supplier Tables

  1. New Tables
    - `customers`
      - `id` (uuid, primary key, references profiles)
      - `company_name` (text, required)
      - `tax_number` (text, optional)
      - `credit_limit` (numeric, default 0)
      - `payment_terms` (integer, default 30 days)
      - `discount_rate` (numeric, default 0)
      - `is_active` (boolean, default true)
      - `created_at`, `updated_at` (timestamps)
    
    - `suppliers`
      - `id` (uuid, primary key, references profiles)
      - `company_name` (text, required)
      - `tax_number` (text, optional)
      - `bank_account` (text, optional)
      - `commission_rate` (numeric, default 0)
      - `min_order_amount` (numeric, default 0)
      - `delivery_days` (integer, default 3)
      - `is_verified` (boolean, default false)
      - `is_active` (boolean, default true)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on both tables
    - Add policies for role-based access
    - Customers can read/update own data
    - Suppliers can read/update own data
    - Admins can manage all data

  3. Triggers
    - Auto-update timestamps
    - Auto-create customer/supplier record when profile is created
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  tax_number text,
  credit_limit numeric(12,2) DEFAULT 0,
  payment_terms integer DEFAULT 30,
  discount_rate numeric(5,2) DEFAULT 0,
  delivery_address text,
  billing_address text,
  contact_person text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  tax_number text,
  bank_account text,
  commission_rate numeric(5,2) DEFAULT 0,
  min_order_amount numeric(10,2) DEFAULT 0,
  delivery_days integer DEFAULT 3,
  service_areas text[], -- Array of cities/regions they serve
  business_license text,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table
CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Customers can update own data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- RLS Policies for suppliers table
CREATE POLICY "Suppliers can read own data"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Suppliers can update own data"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Everyone can read active suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Add updated_at triggers
CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to auto-create customer/supplier records
CREATE OR REPLACE FUNCTION handle_profile_role_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is a customer, create customer record
  IF NEW.role = 'customer' THEN
    INSERT INTO customers (id, company_name, contact_person)
    VALUES (NEW.id, COALESCE(NEW.company, NEW.name), NEW.name);
  END IF;
  
  -- If user is a supplier, create supplier record
  IF NEW.role = 'supplier' THEN
    INSERT INTO suppliers (id, company_name, contact_person)
    VALUES (NEW.id, COALESCE(NEW.company, NEW.name), NEW.name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create customer/supplier records
CREATE TRIGGER trigger_profile_role_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_role_insert();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_name ON suppliers(company_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_verified ON suppliers(is_verified);