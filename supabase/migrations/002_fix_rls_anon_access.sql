-- =============================================
-- FIX: Update RLS policies to allow anon access
-- The app uses PIN login (localStorage only),
-- NOT Supabase auth — so the client uses the anon key.
-- Run this in Supabase SQL Editor.
-- =============================================

-- Drop the old authenticated-only policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.jobs;

-- Create new policies that allow anon access
CREATE POLICY "Allow all read" ON public.jobs
    FOR SELECT USING (true);

CREATE POLICY "Allow all insert" ON public.jobs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update" ON public.jobs
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete" ON public.jobs
    FOR DELETE USING (true);
