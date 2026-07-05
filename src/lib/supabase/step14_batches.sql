-- ============================================================
-- KRISHNA NATURALS — PHASE 11: BATCH TRACKING & QR SYNC
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL UNIQUE,
    manufacture_date DATE,
    expiry_date DATE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    qr_code_data TEXT, -- Can store raw QR data string if needed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on batches
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage batches" ON public.batches;
CREATE POLICY "Admins can manage batches"
ON public.batches
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

-- Public can read batches (for viewing expiry dates on products, if needed)
DROP POLICY IF EXISTS "Public can view batches" ON public.batches;
CREATE POLICY "Public can view batches"
ON public.batches
FOR SELECT
USING (true);


-- 2. Link order_items to specific batches
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS batch_number TEXT; -- Denormalized for easy receipt printing without joining

-- ============================================================
-- End of Phase 11 schema
-- ============================================================
