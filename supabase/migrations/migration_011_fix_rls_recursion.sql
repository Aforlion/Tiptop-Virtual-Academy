-- Tiptop Virtual Academy — RLS Policy Recursion Fix
-- Run this in the Supabase SQL Editor to resolve the infinite recursion on public.profiles.

-- 1. Create a security definer function to check if the current user is an admin.
-- Because SECURITY DEFINER functions run with the privileges of the creator (postgres),
-- they bypass RLS checks inside the function, breaking the recursive loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Drop the recursive policies on public.profiles
DROP POLICY IF EXISTS select_profiles ON public.profiles;
DROP POLICY IF EXISTS update_profiles ON public.profiles;
DROP POLICY IF EXISTS insert_profiles ON public.profiles;

-- 3. Re-create the policies using the is_admin() function
CREATE POLICY select_profiles ON public.profiles 
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY update_profiles ON public.profiles 
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY insert_profiles ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
