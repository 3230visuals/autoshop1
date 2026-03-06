-- ═══════════════════════════════════════════════════
-- SERVICEBAY MIGRATION: Add missing columns
-- Run this in Supabase SQL Editor on existing databases
-- Safe to re-run (uses IF NOT EXISTS)
-- ═══════════════════════════════════════════════════

-- SHOPS: Add individual color & stripe columns
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#f27f0d';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS accent_color TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#09090b';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '#111113';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS font_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS secondary_font_color TEXT DEFAULT '#94a3b8';
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS platform_fee_percent DECIMAL(5,2) DEFAULT 1.00;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS is_test_mode BOOLEAN DEFAULT TRUE;

-- PROFILES: Add email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
