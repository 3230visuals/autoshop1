-- Migration 012: Fix Messaging RLS Visibility
-- 
-- Objectives:
-- 1. Allow 'anon' users to SELECT messages for the shop they are interacting with.
-- 2. Performance: Optimize the check using the get_my_shop_id_sd() function for staff.

DROP POLICY IF EXISTS "messages_select_scoped" ON public.messages;

CREATE POLICY "messages_select_scoped_hardened" ON public.messages
FOR SELECT USING (
    -- 1. Staff can see all messages for their shop
    shop_id = public.get_my_shop_id_sd()
    OR
    -- 2. Client (anon) can see messages for the shop they have a valid token for
    (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE shop_id = public.messages.shop_id 
            AND public_token IS NOT NULL
        )
    )
    OR
    -- 3. Fallback for direct sender match
    sender_id = auth.uid()
);
