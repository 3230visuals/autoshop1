-- ═══════════════════════════════════════════════════
-- MIGRATION 011: Fix Onboarding Handshake & RLS Recursion
-- ═══════════════════════════════════════════════════

-- 1. Fix RLS Recursion in profiles
-- We use SECURITY DEFINER for these functions which bypasses RLS on the table they query.
-- However, we must ensure they are STABLE and don't create circular dependencies.

CREATE OR REPLACE FUNCTION public.get_my_shop_id_sd()
RETURNS UUID 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT shop_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop old profile policies
DROP POLICY IF EXISTS "profiles_select_hardened" ON public.profiles;
DROP POLICY IF EXISTS "profiles_modify_own" ON public.profiles;

-- Re-create profile policies using the SD function
CREATE POLICY "profiles_select_sd" ON public.profiles
FOR SELECT USING (
    id = auth.uid()
    OR
    shop_id = public.get_my_shop_id_sd()
);

CREATE POLICY "profiles_modify_sd" ON public.profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (
    id = auth.uid() 
    AND (
        (SELECT shop_id FROM public.profiles WHERE id = auth.uid()) IS NULL
        OR
        shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    )
    AND (
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
);

-- 2. Explicitly allow staff to INSERT jobs
-- The 'jobs_staff_modify' policy in 010 used FOR ALL with only a USING clause.
-- For INSERT, a WITH CHECK is needed to validate the incoming data.

DROP POLICY IF EXISTS "jobs_staff_modify" ON public.jobs;

CREATE POLICY "jobs_staff_all" ON public.jobs
FOR ALL TO authenticated
USING (
    shop_id = public.get_my_shop_id_sd()
)
WITH CHECK (
    shop_id = public.get_my_shop_id_sd()
);

-- 3. Ensure anon can access jobs via public_token EVEN after it is not a draft
-- The previous 'jobs_anon_draft_modify' was limited to is_draft = true.

DROP POLICY IF EXISTS "jobs_anon_token_access" ON public.jobs;
CREATE POLICY "jobs_client_token_select" ON public.jobs
FOR SELECT TO anon
USING (
    public_token IS NOT NULL
);

-- Allow clients to update their own jobs during onboarding (is_draft = true)
DROP POLICY IF EXISTS "jobs_anon_draft_modify" ON public.jobs;
CREATE POLICY "jobs_client_draft_update" ON public.jobs
FOR UPDATE TO anon
USING (
    is_draft = true AND public_token IS NOT NULL
)
WITH CHECK (
    is_draft = true AND public_token IS NOT NULL
);

-- 4. Messages: Ensure staff/client can write to messages
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_staff_insert" ON public.messages FOR INSERT TO authenticated
WITH CHECK (
    shop_id = public.get_my_shop_id_sd()
);

CREATE POLICY "messages_client_insert" ON public.messages FOR INSERT TO anon
WITH CHECK (
    -- Clients must provide a shop_id that exists
    EXISTS (SELECT 1 FROM public.shops WHERE id = public.messages.shop_id)
);
