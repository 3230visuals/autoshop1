-- Security fix H2: Restrict shops_select to prevent leaking Stripe data
-- Run this in Supabase SQL Editor

-- Drop the old wide-open policy
DROP POLICY IF EXISTS "shops_select" ON public.shops;

-- Authenticated users can only read their OWN shop
CREATE POLICY "shops_select_own" ON public.shops FOR SELECT USING (
    id = public.get_my_shop_id()
);

-- Allow anon key access for client portal (invite links, shop name resolution)
CREATE POLICY "shops_select_anon" ON public.shops FOR SELECT USING (
    auth.role() = 'anon'
);
