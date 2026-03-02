-- =============================================
-- Supabase Migration: Create shops, service_catalog, and orders tables
-- =============================================

-- 1. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id text PRIMARY KEY,
    name text NOT NULL,
    primary_color text,
    accent_color text,
    background_color text,
    card_color text,
    font_color text,
    secondary_font_color text,
    logo_url text,
    stripe_account_id text,
    stripe_onboarding_complete boolean DEFAULT false,
    platform_fee_percent numeric DEFAULT 1.0,
    is_test_mode boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 2. SERVICE CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.service_catalog (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    shop_id text REFERENCES public.shops(id) ON DELETE CASCADE,
    name text NOT NULL,
    price numeric,
    severity text,
    icon text,
    icon_color text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    shop_id text REFERENCES public.shops(id) ON DELETE CASCADE,
    order_number text UNIQUE NOT NULL,
    approved_items jsonb DEFAULT '[]'::jsonb,
    subtotal numeric DEFAULT 0,
    tax numeric DEFAULT 0,
    platform_fee numeric DEFAULT 0,
    total numeric DEFAULT 0,
    paid boolean DEFAULT false,
    payment_method text,
    paid_date text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- SEED DEFAULT DATA
-- =============================================
INSERT INTO public.shops (
    id, name, primary_color, accent_color, background_color, 
    card_color, font_color, secondary_font_color, is_test_mode
) VALUES (
    'SHOP-01', 'Service Bay Software', '#4f46e5', '#818cf8', 
    '#0a0a0c', '#111114', '#ffffff', '#94a3b8', true
) ON CONFLICT (id) DO NOTHING;

-- Seed default services for SHOP-01
INSERT INTO public.service_catalog (id, shop_id, name, price, severity, icon, icon_color, description)
VALUES 
    ('srv-1', 'SHOP-01', 'Full Synthetic Oil Change', 85.00, 'recommended', 'oil_barrel', 'text-blue-400', 'Premium oil and filter replacement.'),
    ('srv-2', 'SHOP-01', 'Brake Pad Replacement', 189.50, 'critical', 'minor_crash', 'text-red-400', 'Front ceramic brake pads.'),
    ('srv-3', 'SHOP-01', 'Tire Rotation & Balance', 45.00, 'recommended', 'tire_repair', 'text-emerald-400', 'Extend tire life and improve ride.')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Allow anon client access)
-- =============================================

-- Shops: Allow anyone to read shops (clients need it for theme loading)
CREATE POLICY "Allow all read shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Allow all update shops" ON public.shops FOR UPDATE USING (true) WITH CHECK (true);

-- Service Catalog: Allow anyone to read
CREATE POLICY "Allow all read services" ON public.service_catalog FOR SELECT USING (true);
CREATE POLICY "Allow all insert services" ON public.service_catalog FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update services" ON public.service_catalog FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete services" ON public.service_catalog FOR DELETE USING (true);

-- Orders: Allow anyone to read/write orders (until real auth is added)
CREATE POLICY "Allow all read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow all insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_catalog;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
