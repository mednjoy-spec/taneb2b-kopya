/*
  # Fix Profile Creation Trigger

  1. Functions
    - Drop and recreate handle_new_user function with proper error handling
    - Add better logging and error management
    - Fix potential syntax issues

  2. Security
    - Proper SECURITY DEFINER usage
    - Handle edge cases and errors gracefully
*/

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_company TEXT;
  user_phone TEXT;
  user_address TEXT;
  user_city TEXT;
BEGIN
  -- Extract metadata with safe defaults
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  user_company := NEW.raw_user_meta_data->>'company';
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_address := NEW.raw_user_meta_data->>'address';
  user_city := NEW.raw_user_meta_data->>'city';

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    company,
    phone,
    address,
    city,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role::user_role,
    user_company,
    user_phone,
    user_address,
    user_city,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;