-- ============================================================
-- KRISHNA NATURALS — DB FIX MIGRATION
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE — add email column (used by admin orders
--    shipping email flow which does: select('email').eq('id', user_id))
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- ────────────────────────────────────────────────────────────
-- 2. ORDERS TABLE — the checkout code inserts flat columns
--    (shipping_name, shipping_phone, shipping_address_line1,
--     shipping_city, shipping_state, shipping_pincode)
--    but the admin code reads a JSONB column called
--    shipping_details and an items column.
--    We add the missing flat columns AND a payment_method
--    column (used in label/invoice generation).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_name        TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone       TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city        TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state       TEXT,
  ADD COLUMN IF NOT EXISTS shipping_pincode     TEXT,
  ADD COLUMN IF NOT EXISTS payment_method       TEXT DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS coupon_code          TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount      NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal             NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS shipping_fee         NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS razorpay_order_id    TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id  TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature   TEXT,
  ADD COLUMN IF NOT EXISTS courier_name         TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number      TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url         TEXT;

-- ────────────────────────────────────────────────────────────
-- 3. We leave the existing shipping_details column untouched.
--    Old orders will continue to have their JSON/text data here.
--    New orders will use the flat columns added above.
--    The frontend code has been updated to handle both.
-- ────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- 4. ORDER ITEMS TABLE — create if not exists
--    (used in checkout finalizeOrder to store cart line items)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   UUID,
  product_name TEXT,
  product_image TEXT,
  quantity     INTEGER NOT NULL DEFAULT 1,
  price        NUMERIC(10,2) NOT NULL,
  total        NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 5. STORE SETTINGS — ensure row with id=1 exists
--    (admin settings page queries .eq('id', 1).single())
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                      INTEGER PRIMARY KEY DEFAULT 1,
  cod_enabled             BOOLEAN DEFAULT TRUE,
  maintenance_mode        BOOLEAN DEFAULT FALSE,
  shipping_fee            NUMERIC(10,2) DEFAULT 100,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 500,
  updated_at              TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.store_settings (id, cod_enabled, maintenance_mode, shipping_fee, free_shipping_threshold)
VALUES (1, true, false, 100, 500)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. ADDRESSES TABLE — ensure it exists with correct schema
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  name            TEXT,
  phone           TEXT NOT NULL DEFAULT '',
  address_line_1  TEXT NOT NULL,
  address_line_2  TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  postal_code     TEXT NOT NULL,
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. RLS POLICIES
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ── profiles ──
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- ── orders ──
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can cancel their own orders" ON public.orders;
CREATE POLICY "Users can cancel their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid()::text = user_id AND status IN ('pending','processing'));

-- Admin can do everything on orders (match your admin emails)
DROP POLICY IF EXISTS "Admin full access on orders" ON public.orders;
CREATE POLICY "Admin full access on orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
        AND profiles.role = 'admin'
    )
  );

-- ── order_items ──
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert order items for their orders" ON public.order_items;
CREATE POLICY "Users can insert order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Admin full access on order_items" ON public.order_items;
CREATE POLICY "Admin full access on order_items"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
        AND profiles.role = 'admin'
    )
  );

-- ── addresses ──
DROP POLICY IF EXISTS "Users manage their own addresses" ON public.addresses;
CREATE POLICY "Users manage their own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ── store_settings (read by everyone, write only by admin) ──
DROP POLICY IF EXISTS "Public read store_settings" ON public.store_settings;
CREATE POLICY "Public read store_settings"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin write store_settings" ON public.store_settings;
CREATE POLICY "Admin write store_settings"
  ON public.store_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
        AND profiles.role = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────
-- 8. deduct_stock_and_log RPC (called by checkout)
--    Safe stub – replace with real logic if you have inventory
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deduct_stock_and_log(
  p_items       JSONB,
  p_email       TEXT,
  p_order_number TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Deduct stock for each item in the order
  FOR i IN 0..jsonb_array_length(p_items)-1 LOOP
    UPDATE public.products
    SET stock = GREATEST(0, stock - (p_items->i->>'quantity')::int)
    WHERE id = (p_items->i->>'id')::uuid;
  END LOOP;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 9. increment_coupon_usage RPC (called by checkout)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.coupons
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE code = p_code;
$$;

-- ────────────────────────────────────────────────────────────
-- 10. profiles — add role column for admin checks
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Set admin role for your admin account (replace with your Firebase UID):
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_FIREBASE_UID_HERE';
