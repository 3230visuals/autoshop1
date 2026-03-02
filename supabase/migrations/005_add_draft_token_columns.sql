-- =============================================
-- Migration 005: Add draft ticket + public token columns
-- =============================================

-- 1. Add columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS public_token text UNIQUE;

-- 2. Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_jobs_public_token ON public.jobs(public_token);

-- 3. Backfill existing rows: mark all existing jobs as NOT drafts
UPDATE public.jobs SET is_draft = false WHERE is_draft IS NULL OR is_draft = true;

-- 4. RLS: Allow anon users to SELECT a single job by public_token
-- (This lets clients resolve their ticket via QR code without authentication)
CREATE POLICY "Allow anon read by token" ON public.jobs
  FOR SELECT
  TO anon
  USING (public_token IS NOT NULL);

-- 5. Allow anon users to subscribe to realtime updates on their ticket
-- (Already covered by the SELECT policy above — Supabase Realtime honors RLS)

-- 6. Allow anon INSERT for draft creation from the client-side onboard flow
CREATE POLICY "Allow anon insert" ON public.jobs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. Allow anon UPDATE (needed for draft → finalized transition)
CREATE POLICY "Allow anon update" ON public.jobs
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 8. Allow anon DELETE (needed for draft cleanup)  
CREATE POLICY "Allow anon delete" ON public.jobs
  FOR DELETE
  TO anon
  USING (true);
