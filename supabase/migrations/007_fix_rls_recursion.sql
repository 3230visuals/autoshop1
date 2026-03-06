-- ═══════════════════════════════════════════════════
-- MIGRATION 007: Fix RLS infinite recursion
-- 
-- Problem:  profiles_select_shop policy does:
--   shop_id = (SELECT shop_id FROM profiles WHERE id = auth.uid())
-- This causes infinite recursion because the SELECT triggers
-- the same RLS policy again, looping forever → 500 error.
--
-- Fix: Use SECURITY DEFINER functions that bypass RLS
-- to safely look up the current user's shop_id and role.
-- ═══════════════════════════════════════════════════

-- Step 1: Create helper functions (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_shop_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT shop_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 2: Drop ALL existing policies (clean slate)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all relevant tables
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'shops', 'profiles', 'vehicles', 'service_items',
            'jobs', 'messages', 'inventory', 'parts',
            'notifications', 'referrals', 'payments', 'orders'
          )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 3: Re-create all policies using the safe helper functions

-- SHOPS
CREATE POLICY "shops_select" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_insert_auth" ON public.shops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "shops_modify" ON public.shops FOR ALL USING (
    id = public.get_my_shop_id()
);

-- PROFILES (NO self-referencing sub-selects!)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_shop" ON public.profiles FOR SELECT USING (
    shop_id = public.get_my_shop_id()
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- VEHICLES
CREATE POLICY "vehicles_select_own" ON public.vehicles FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "vehicles_select_shop" ON public.vehicles FOR SELECT USING (
    owner_id IN (SELECT id FROM public.profiles WHERE shop_id = public.get_my_shop_id())
);
CREATE POLICY "vehicles_modify_own" ON public.vehicles FOR ALL USING (auth.uid() = owner_id);

-- SERVICE_ITEMS
CREATE POLICY "service_items_select" ON public.service_items FOR SELECT USING (
    shop_id = public.get_my_shop_id()
);
CREATE POLICY "service_items_modify" ON public.service_items FOR ALL USING (
    shop_id = public.get_my_shop_id()
    AND public.get_my_role() IN ('OWNER', 'ADMIN')
);

-- JOBS
CREATE POLICY "jobs_select_shop" ON public.jobs FOR SELECT USING (
    shop_id = public.get_my_shop_id()
);
CREATE POLICY "jobs_select_client" ON public.jobs FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "jobs_modify_staff" ON public.jobs FOR ALL USING (
    shop_id = public.get_my_shop_id()
    AND public.get_my_role() IN ('OWNER', 'ADMIN', 'MECHANIC')
);

-- MESSAGES
CREATE POLICY "messages_select_shop" ON public.messages FOR SELECT USING (
    shop_id = public.get_my_shop_id()
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

-- INVENTORY
CREATE POLICY "inventory_select" ON public.inventory FOR SELECT USING (
    shop_id = public.get_my_shop_id()
);
CREATE POLICY "inventory_modify" ON public.inventory FOR ALL USING (
    shop_id = public.get_my_shop_id()
    AND public.get_my_role() IN ('OWNER', 'ADMIN')
);

-- PARTS
CREATE POLICY "parts_select" ON public.parts FOR SELECT USING (
    job_id IN (SELECT id FROM public.jobs WHERE shop_id = public.get_my_shop_id())
);
CREATE POLICY "parts_modify" ON public.parts FOR ALL USING (
    job_id IN (SELECT id FROM public.jobs WHERE shop_id = public.get_my_shop_id())
    AND public.get_my_role() IN ('OWNER', 'ADMIN', 'MECHANIC')
);

-- NOTIFICATIONS
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = profile_id);

-- REFERRALS
CREATE POLICY "referrals_select" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "referrals_insert" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- PAYMENTS
CREATE POLICY "payments_select_client" ON public.payments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "payments_select_shop" ON public.payments FOR SELECT USING (
    job_id IN (SELECT id FROM public.jobs WHERE shop_id = public.get_my_shop_id())
);

-- ORDERS
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (
    shop_id = public.get_my_shop_id()
);
CREATE POLICY "orders_modify" ON public.orders FOR ALL USING (
    shop_id = public.get_my_shop_id()
);
