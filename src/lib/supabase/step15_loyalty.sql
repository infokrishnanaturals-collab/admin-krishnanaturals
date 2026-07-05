-- ============================================================
-- KRISHNA NATURALS — PHASE 7: LOYALTY & POINTS PROGRAM
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add points to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;

-- 2. Add points tracking to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0;

-- 3. Create a points transaction history table (optional but recommended for auditing)
CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    points_amount INTEGER NOT NULL, -- positive for earned, negative for used
    transaction_type TEXT NOT NULL, -- 'earned_from_purchase', 'redeemed_for_discount', 'admin_adjustment'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own points history
DROP POLICY IF EXISTS "Users can view own points history" ON public.points_history;
CREATE POLICY "Users can view own points history"
ON public.points_history
FOR SELECT
USING (auth.uid()::text = user_id);

-- Admins can do anything
DROP POLICY IF EXISTS "Admins can manage points history" ON public.points_history;
CREATE POLICY "Admins can manage points history"
ON public.points_history
FOR ALL
USING (
  auth.email() IN (
    'info.krishnanaturals@gmail.com',
    'veer.b.builds@gmail.com'
  )
)
WITH CHECK (
  auth.email() IN (
    'info.krishnanaturals@gmail.com',
    'veer.b.builds@gmail.com'
  )
);

-- ============================================================
-- End of Phase 7 schema
-- ============================================================
