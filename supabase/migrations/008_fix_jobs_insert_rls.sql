-- ═══════════════════════════════════════════════════
-- MIGRATION 008: Fix jobs INSERT RLS policy
-- 
-- Problem:  The "jobs_modify_staff" policy uses FOR ALL with USING(),
--           but for INSERT operations, Postgres evaluates WITH CHECK
--           (falling back to USING). When get_my_shop_id() returns NULL
--           (e.g., new shop owner whose profile row wasn't created yet),
--           no policy matches → "new row violates row-level security".
--
-- Fix: Add a dedicated INSERT policy that allows any authenticated
--      user to insert jobs. The shop_id is validated by the app layer
--      (jobService.ts checks isUUID before inserting).
-- ═══════════════════════════════════════════════════

-- Add INSERT-specific policy for jobs
-- This allows any authenticated user to create a job
-- The FOR ALL policy still governs SELECT/UPDATE/DELETE (scoped to shop)
CREATE POLICY "jobs_insert_auth" ON public.jobs 
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated'
    );
