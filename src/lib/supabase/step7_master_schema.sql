-- ============================================================
-- KRISHNA NATURALS — MASTER SCHEMA FIX
-- Run this in: Supabase Dashboard → SQL Editor
-- This script safely creates missing tables and columns without 
-- destroying existing data.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist in case table was created with limited schema
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- ────────────────────────────────────────────────────────────
-- 2. ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  subtotal NUMERIC(10,2),
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT DEFAULT 'razorpay',
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address_line1 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS shipping_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state TEXT,
  ADD COLUMN IF NOT EXISTS shipping_pincode TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
  ADD COLUMN IF NOT EXISTS courier_name TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- ────────────────────────────────────────────────────────────
-- 3. WISHLISTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ────────────────────────────────────────────────────────────
-- 4. ADDRESSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT,
  phone TEXT NOT NULL DEFAULT '',
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- ────────────────────────────────────────────────────────────
-- 5. ABANDONED CARTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  user_email TEXT,
  cart_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 6. ORDER ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
