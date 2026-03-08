-- ═══════════════════════════════════════════════════
-- MIGRATION 013: RLS Standardisation & Recursion Fix
-- 
-- Objectives:
-- 1. Standardise get_shop_id_sd() to return TEXT (compatible with all IDs).
-- 2. Resolve infinite recursion in 'profiles' RLS by using the SD function.
-- 3. Consolidate client/anon access to ensure portal loads reliably.
-- ═══════════════════════════════════════════════════

-- 1. Create a version-proof helper function
-- SECURITY DEFINER bypasses RLS, making it safe for lookups.
CREATE OR REPLACE FUNCTION public.get_shop_id_sd()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text;
$$;

-- 2. Clean up duplicate/conflicting policies
DROP POLICY IF EXISTS "profiles_select_sd" ON public.profiles;
DROP POLICY IF EXISTS "profiles_modify_sd" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_hardened" ON public.profiles;
DROP POLICY IF EXISTS "profiles_modify_own" ON public.profiles;
DROP POLICY IF EXISTS "jobs_staff_all" ON public.jobs;
DROP POLICY IF EXISTS "jobs_staff_select" ON public.jobs;
DROP POLICY IF EXISTS "jobs_client_token_select" ON public.jobs;
DROP POLICY IF EXISTS "messages_select_scoped_hardened" ON public.messages;

-- 3. Profiles: Purely SD-based (No recursive selects)
CREATE POLICY "profiles_select_v2" ON public.profiles
FOR SELECT USING (
    id = auth.uid()::text
    OR
    shop_id = public.get_shop_id_sd()
);

CREATE POLICY "profiles_update_v2" ON public.profiles
FOR UPDATE USING (id = auth.uid()::text)
WITH CHECK (
    id = auth.uid()::text
    AND (
        (public.get_shop_id_sd()) IS NULL
        OR
        shop_id = (public.get_shop_id_sd())
    )
);

-- 4. Jobs: Safe cross-tenant access for Staff & Clients
CREATE POLICY "jobs_staff_v2" ON public.jobs
FOR ALL TO authenticated
USING (
    shop_id = public.get_shop_id_sd()
)
WITH CHECK (
    shop_id = public.get_shop_id_sd()
);

CREATE POLICY "jobs_client_v2" ON public.jobs
FOR SELECT
USING (
    (auth.uid()::text = client_id)
    OR
    (public_token IS NOT NULL)
);

-- 5. Messages: Allow portal transparency
CREATE POLICY "messages_v2" ON public.messages
FOR SELECT USING (
    shop_id = public.get_shop_id_sd()
    OR
    EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE shop_id = public.messages.shop_id 
        AND (client_id = auth.uid()::text OR public_token IS NOT NULL)
    )
);

CREATE POLICY "messages_insert_v2" ON public.messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid()::text
    OR
    (auth.role() = 'anon') -- Allow invite link users to send messages
);
