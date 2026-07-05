-- ============================================================
-- KRISHNA NATURALS — STEP 6: FIX MISSING TABLES AND COLUMNS
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES TABLE FIXES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

-- Enable RLS and Policies for Wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own wishlists" ON public.wishlists;
CREATE POLICY "Users manage their own wishlists"
  ON public.wishlists FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 3. ADDRESSES TABLE STANDARDIZATION
-- Check if table exists, if so make sure it has the right columns.
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- (Optional) if old names were used, keep both for now to prevent 400 errors
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT;
