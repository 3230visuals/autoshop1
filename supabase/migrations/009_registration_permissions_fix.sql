-- ═══════════════════════════════════════════════════
-- 009_registration_permissions_fix.sql
-- Fixes permissions for shop creation in Step 2 of registration
-- ═══════════════════════════════════════════════════

-- 1. Ensure shops can be inserted by authenticated users
DROP POLICY IF EXISTS "shops_insert_auth" ON public.shops;
CREATE POLICY "shops_insert_auth" 
ON public.shops 
FOR INSERT 
WITH CHECK (true); 

-- 2. Ensure owners can update their OWN profile's shop_id and role
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Ensure profiles can be inserted if the trigger failed
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Ensure shop_id column is nullable for fresh signups
ALTER TABLE public.profiles ALTER COLUMN shop_id DROP NOT NULL;