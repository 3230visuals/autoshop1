-- =============================================
-- Supabase Migration: Create remaining tables
-- =============================================

-- 2. PROFILES TABLE (USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id text PRIMARY KEY,
    shop_id text REFERENCES public.shops(id) ON DELETE SET NULL,
    full_name text,
    avatar_url text,
    role text CHECK (role IN ('ADMIN', 'OWNER', 'MECHANIC', 'CLIENT')),
    phone text,
    created_at timestamptz DEFAULT now()
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    owner_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
    year int,
    make text,
    model text,
    license_plate text,
    vin text,
    tag text,
    image_url text,
    health_score int DEFAULT 100,
    status text DEFAULT 'ready',
    created_at timestamptz DEFAULT now()
);

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    shop_id text REFERENCES public.shops(id) ON DELETE CASCADE,
    sender_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
    text text NOT NULL,
    sender_role text,
    timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::BIGINT,
    created_at timestamptz DEFAULT now()
);

-- 7. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    shop_id text REFERENCES public.shops(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,
    quantity int DEFAULT 0,
    price numeric,
    min_stock int DEFAULT 5,
    location text,
    created_at timestamptz DEFAULT now()
);

-- 8. PARTS TABLE
CREATE TABLE IF NOT EXISTS public.parts (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
    name text NOT NULL,
    part_number text,
    vendor text,
    cost numeric,
    status text CHECK (status IN ('needed', 'ordered', 'arrived', 'installed')),
    eta text,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id text REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text,
    title text,
    body text,
    read boolean DEFAULT false,
    timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::BIGINT,
    created_at timestamptz DEFAULT now()
);

-- 10. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    referrer_id text REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'visited')),
    created_at timestamptz DEFAULT now()
);

-- 11. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
    order_number text UNIQUE,
    client_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount numeric,
    method text,
    paid_at timestamptz DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Allow anon client access)
-- =============================================

CREATE POLICY "Allow all read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Allow all read vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Allow all insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update vehicles" ON public.vehicles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete vehicles" ON public.vehicles FOR DELETE USING (true);

CREATE POLICY "Allow all read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow all insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update messages" ON public.messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete messages" ON public.messages FOR DELETE USING (true);

CREATE POLICY "Allow all read inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow all insert inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update inventory" ON public.inventory FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete inventory" ON public.inventory FOR DELETE USING (true);

CREATE POLICY "Allow all read parts" ON public.parts FOR SELECT USING (true);
CREATE POLICY "Allow all insert parts" ON public.parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update parts" ON public.parts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete parts" ON public.parts FOR DELETE USING (true);

CREATE POLICY "Allow all read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow all insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update notifications" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete notifications" ON public.notifications FOR DELETE USING (true);

CREATE POLICY "Allow all read referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Allow all insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update referrals" ON public.referrals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete referrals" ON public.referrals FOR DELETE USING (true);

CREATE POLICY "Allow all read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow all insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete payments" ON public.payments FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
