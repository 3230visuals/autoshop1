-- =============================================
-- Supabase Migration: Create jobs table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================

-- 1. Create the jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id text NOT NULL DEFAULT 'SHOP-01',
    client_id text NOT NULL,
    client_name text,
    vehicle_name text,
    vehicle_image text,
    status text NOT NULL DEFAULT 'Checked In',
    priority text NOT NULL DEFAULT 'medium',
    bay text DEFAULT 'TBD',
    staff_id text DEFAULT 'u3',
    time_logs jsonb DEFAULT '[]'::jsonb,
    total_time integer DEFAULT 0,
    services jsonb DEFAULT '[]'::jsonb,
    financials jsonb DEFAULT '{"subtotal":0,"tax":0,"total":0}'::jsonb,
    progress integer DEFAULT 0,
    stage_index integer DEFAULT 0,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 2. Enable Row-Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow all authenticated users to read jobs (within their shop in the future)
CREATE POLICY "Allow authenticated read" ON public.jobs
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert jobs
CREATE POLICY "Allow authenticated insert" ON public.jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update jobs
CREATE POLICY "Allow authenticated update" ON public.jobs
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all authenticated users to delete jobs
CREATE POLICY "Allow authenticated delete" ON public.jobs
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Enable realtime for the jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- 5. Create index for shop_id lookups
CREATE INDEX IF NOT EXISTS idx_jobs_shop_id ON public.jobs(shop_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
