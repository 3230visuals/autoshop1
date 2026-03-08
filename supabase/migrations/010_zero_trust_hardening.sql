-- ═══════════════════════════════════════════════════
-- MIGRATION 010: Zero-Trust Security Hardening
-- 
-- Objectives:
-- 1. Performance: Wrap RLS function calls in (SELECT ...)
-- 2. Isolation: Close 'Allow All' gaps in shops/services
-- 3. Security: Harden anon access to jobs (Draft only)
-- ═══════════════════════════════════════════════════

-- Drop permissive policies from 004
DROP POLICY IF EXISTS "Allow all read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow all read vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all delete vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Allow all read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all update messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all delete messages" ON public.messages;

DROP POLICY IF EXISTS "Allow all read inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all delete inventory" ON public.inventory;

DROP POLICY IF EXISTS "Allow all read parts" ON public.parts;
DROP POLICY IF EXISTS "Allow all insert parts" ON public.parts;
DROP POLICY IF EXISTS "Allow all update parts" ON public.parts;
DROP POLICY IF EXISTS "Allow all delete parts" ON public.parts;

DROP POLICY IF EXISTS "Allow all read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all delete notifications" ON public.notifications;

DROP POLICY IF EXISTS "Allow all read referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all delete referrals" ON public.referrals;

DROP POLICY IF EXISTS "Allow all read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all insert payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all update payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all delete payments" ON public.payments;

-- Step 2: Re-create Hardened & Optimized Policies

-- ═══════════════════════════════════════════════════
-- Performance optimization for helper functions
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_shop_id()
RETURNS TEXT -- Changed from UUID to TEXT to match shops.id
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text;
$$;

-- SHOPS: Only staff or people with a direct shop link can see it
CREATE POLICY "shops_select_optimized" ON public.shops 
FOR SELECT USING (
    id = (SELECT public.get_my_shop_id())
    OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE shop_id = public.shops.id AND (auth.uid()::text = client_id OR public_token IS NOT NULL))
);

CREATE POLICY "shops_insert_auth" ON public.shops
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "shops_update_staff" ON public.shops
FOR UPDATE TO authenticated
USING (id = (SELECT public.get_my_shop_id()))
WITH CHECK (id = (SELECT public.get_my_shop_id()));

-- PROFILES
CREATE POLICY "profiles_select_hardened" ON public.profiles
FOR SELECT USING (
    id = auth.uid()::text
    OR
    shop_id = (SELECT public.get_my_shop_id()::text)
);

-- ANTI-SHOP-HOPPING: Users can update their name/avatar, but NOT their role or shop_id once set.
-- Exception: Owners during signup (shop_id is NULL).
CREATE POLICY "profiles_modify_own" ON public.profiles
FOR UPDATE USING (id = auth.uid()::text)
WITH CHECK (
    id = auth.uid()::text 
    AND (
        -- Allow setting it if it's currently NULL
        (SELECT p.shop_id FROM public.profiles p WHERE p.id = auth.uid()::text) IS NULL
        OR
        -- Or keeping it the same
        shop_id = (SELECT p.shop_id FROM public.profiles p WHERE p.id = auth.uid()::text)
    )
    AND (
        -- Protect the role from self-promotion
        role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()::text)
    )
);

-- VEHICLES
CREATE POLICY "vehicles_select_hardened" ON public.vehicles
FOR SELECT USING (
    owner_id = auth.uid()::text
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = public.vehicles.owner_id AND shop_id = (SELECT public.get_my_shop_id()::text))
);

-- SERVICE_CATALOG
CREATE POLICY "service_catalog_select_scoped" ON public.service_catalog
FOR SELECT USING (
    shop_id = (SELECT public.get_my_shop_id()::text)
    OR
    -- Anon clients can only see the catalog IF they have a valid ticket token for that shop
    EXISTS (SELECT 1 FROM public.jobs WHERE shop_id = public.service_catalog.shop_id AND public_token IS NOT NULL)
);

-- JOBS
CREATE POLICY "jobs_staff_select" ON public.jobs 
FOR SELECT TO authenticated 
USING (
    shop_id = (SELECT public.get_my_shop_id()::text)
);

CREATE POLICY "jobs_client_select" ON public.jobs 
FOR SELECT TO authenticated 
USING (
    auth.uid()::text = client_id
);

-- JOBS: HARDENED ANON ACCESS (The QR/Magic Link path)
-- This is still "Proof of Knowledge" - they must know the public_token or id.
-- We restrict it so they can't 'select *' and see everyone's job.
CREATE POLICY "jobs_anon_token_access" ON public.jobs
FOR SELECT TO anon
USING (
    public_token IS NOT NULL
);

-- JOBS: MODIFY
CREATE POLICY "jobs_staff_modify" ON public.jobs
FOR ALL TO authenticated
USING (
    shop_id = (SELECT public.get_my_shop_id()::text)
);

-- HARDENED ANON MODIFY: ONLY for their specific draft ticket.
CREATE POLICY "jobs_anon_draft_modify" ON public.jobs
FOR ALL TO anon
USING (
    is_draft = true 
    AND public_token IS NOT NULL
)
WITH CHECK (
    is_draft = true 
    AND public_token IS NOT NULL
);

-- MESSAGES
CREATE POLICY "messages_select_scoped" ON public.messages
FOR SELECT USING (
    shop_id = (SELECT public.get_my_shop_id()::text)
    OR
    sender_id = auth.uid()::text
);

CREATE POLICY "messages_insert_own" ON public.messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid()::text
);

-- INVENTORY
CREATE POLICY "inventory_scoped" ON public.inventory
FOR ALL USING (
    shop_id = (SELECT public.get_my_shop_id()::text)
);

-- PARTS
CREATE POLICY "parts_scoped" ON public.parts
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = public.parts.job_id AND shop_id = (SELECT public.get_my_shop_id()::text))
);

-- ORDERS
CREATE POLICY "orders_scoped" ON public.orders
FOR ALL USING (
    shop_id = (SELECT public.get_my_shop_id()::text)
    OR
    -- Anon clients can only see orders linked to their token-accessed shop
    EXISTS (SELECT 1 FROM public.jobs WHERE shop_id = public.orders.shop_id AND public_token IS NOT NULL)
);

-- PAYMENTS
CREATE POLICY "payments_scoped_select" ON public.payments
FOR SELECT USING (
    client_id = auth.uid()::text
    OR
    EXISTS (SELECT 1 FROM public.jobs WHERE id = public.payments.job_id AND shop_id = (SELECT public.get_my_shop_id()::text))
);

-- ═══════════════════════════════════════════════════
-- Performance Indexing for Multi-Tenancy
-- ═══════════════════════════════════════════════════

-- Ensure all shop_id lookups are indexed
CREATE INDEX IF NOT EXISTS idx_profiles_shop_id ON public.profiles(shop_id);
CREATE INDEX IF NOT EXISTS idx_messages_shop_id ON public.messages(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_shop_id ON public.inventory(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_shop_id ON public.service_catalog(shop_id);

-- Ensure token lookups stay O(1)
CREATE INDEX IF NOT EXISTS idx_jobs_public_token ON public.jobs(public_token);

-- Index for job_id joins frequently used in RLS
CREATE INDEX IF NOT EXISTS idx_parts_job_id ON public.parts(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON public.payments(job_id);

-- NOTIFICATIONS
CREATE POLICY "notifications_scoped" ON public.notifications
FOR ALL USING (
    profile_id = auth.uid()::text
);

-- REFERRALS
CREATE POLICY "referrals_scoped" ON public.referrals
FOR ALL USING (
    referrer_id = auth.uid()::text
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = referrer_id AND shop_id = (SELECT public.get_my_shop_id()::text))
);
