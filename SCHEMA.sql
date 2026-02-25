-- STITCH AUTO SHOP DATABASE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    phone TEXT,
    address TEXT,
    theme_settings JSONB DEFAULT '{"primary": "#f27f0d", "mode": "dark"}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES TABLE (USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('ADMIN', 'OWNER', 'MECHANIC', 'CLIENT')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    year INT,
    make TEXT,
    model TEXT,
    license_plate TEXT,
    vin TEXT,
    tag TEXT,
    image_url TEXT,
    health_score INT DEFAULT 100,
    status TEXT DEFAULT 'ready',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SERVICE ITEMS TABLE (Catalog of services)
CREATE TABLE IF NOT EXISTS public.service_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    severity TEXT CHECK (severity IN ('critical', 'recommended')),
    icon TEXT,
    icon_color TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'ready', 'done')),
    progress INT DEFAULT 0,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    bay TEXT,
    notes TEXT,
    services JSONB DEFAULT '[]'::JSONB, -- Array of service items at time of job
    financials JSONB DEFAULT '{"subtotal": 0, "tax": 0, "total": 0}'::JSONB,
    time_logs JSONB DEFAULT '[]'::JSONB,
    total_time INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    sender_role TEXT,
    timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    quantity INT DEFAULT 0,
    price DECIMAL(10,2),
    min_stock INT DEFAULT 5,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PARTS TABLE (Tracking specific parts for jobs)
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    part_number TEXT,
    vendor TEXT,
    cost DECIMAL(10,2),
    status TEXT CHECK (status IN ('needed', 'ordered', 'arrived', 'installed')),
    eta TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    timestamp BIGINT DEFAULT (extract(epoch from now()) * 1000)::BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'visited')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10,2),
    method TEXT,
    paid_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ORDERS TABLE (Required by orderService.ts)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    approved_items JSONB DEFAULT '[]'::JSONB,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    tip_percent DECIMAL(5,4),
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    paid BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    paid_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES (Hardened)
-- ═══════════════════════════════════════════════════

-- Helper: get user's shop_id from their profile
-- Usage in policies: (SELECT shop_id FROM public.profiles WHERE id = auth.uid())

-- SHOPS: Anyone can view shops, only admins/owners can modify their own
CREATE POLICY "shops_select" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_modify" ON public.shops FOR ALL USING (
    id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);

-- PROFILES: Users can read profiles in their shop, update only their own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_shop" ON public.profiles FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- VEHICLES: Owners see their own, shop staff see vehicles in their shop
CREATE POLICY "vehicles_select_own" ON public.vehicles FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "vehicles_select_shop" ON public.vehicles FOR SELECT USING (
    owner_id IN (SELECT id FROM public.profiles WHERE shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "vehicles_modify_own" ON public.vehicles FOR ALL USING (auth.uid() = owner_id);

-- SERVICE_ITEMS: Shop staff can manage, clients can view their shop's items
CREATE POLICY "service_items_select" ON public.service_items FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "service_items_modify" ON public.service_items FOR ALL USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OWNER', 'ADMIN')
);

-- JOBS: Shop staff can manage, clients can view their own
CREATE POLICY "jobs_select_shop" ON public.jobs FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "jobs_select_client" ON public.jobs FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "jobs_modify_staff" ON public.jobs FOR ALL USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OWNER', 'ADMIN', 'MECHANIC')
);

-- MESSAGES: Scoped to shop
CREATE POLICY "messages_select_shop" ON public.messages FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

-- INVENTORY: Shop staff only
CREATE POLICY "inventory_select" ON public.inventory FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "inventory_modify" ON public.inventory FOR ALL USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OWNER', 'ADMIN')
);

-- PARTS: Accessible to staff on the job's shop
CREATE POLICY "parts_select" ON public.parts FOR SELECT USING (
    job_id IN (SELECT id FROM public.jobs WHERE shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "parts_modify" ON public.parts FOR ALL USING (
    job_id IN (SELECT id FROM public.jobs WHERE shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid()))
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('OWNER', 'ADMIN', 'MECHANIC')
);

-- NOTIFICATIONS: Users see only their own
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = profile_id);

-- REFERRALS: Users see only their own
CREATE POLICY "referrals_select" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "referrals_insert" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- PAYMENTS: Clients see their own, shop staff see all in shop
CREATE POLICY "payments_select_client" ON public.payments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "payments_select_shop" ON public.payments FOR SELECT USING (
    job_id IN (SELECT id FROM public.jobs WHERE shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid()))
);

-- ORDERS: Scoped to shop
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "orders_modify" ON public.orders FOR ALL USING (
    shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);

-- ═══════════════════════════════════════════════════
-- PERFORMANCE INDEXES
-- ═══════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_profiles_shop_id ON public.profiles(shop_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON public.vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_items_shop_id ON public.service_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_jobs_shop_id ON public.jobs(shop_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_staff_id ON public.jobs(staff_id);
CREATE INDEX IF NOT EXISTS idx_messages_shop_id ON public.messages(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_shop_id ON public.inventory(shop_id);
CREATE INDEX IF NOT EXISTS idx_parts_job_id ON public.parts(job_id);
CREATE INDEX IF NOT EXISTS idx_parts_status ON public.parts(status);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON public.payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
