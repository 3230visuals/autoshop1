-- MIGRATION 007: Add client contact fields to jobs table
-- These columns are used by jobService.ts but were missing from SCHEMA.sql

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- Add index for potential lookups
CREATE INDEX IF NOT EXISTS idx_jobs_client_email ON public.jobs(client_email);
