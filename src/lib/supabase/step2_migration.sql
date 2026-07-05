-- ============================================================
-- KRISHNA NATURALS — STEP 2 ADVANCED MIGRATION
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. FULL INVENTORY LOGGING RPC
--    Upgrades deduct_stock_and_log to insert into inventory_logs
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deduct_stock_and_log(
  p_items       JSONB,
  p_email       TEXT,
  p_order_number TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_product_id UUID;
  v_quantity INT;
  v_product_name TEXT;
  v_current_stock INT;
  v_new_stock INT;
BEGIN
  -- Deduct stock for each item in the order
  FOR i IN 0..jsonb_array_length(p_items)-1 LOOP
    v_product_id := (p_items->i->>'id')::uuid;
    v_quantity := (p_items->i->>'quantity')::int;
    v_product_name := p_items->i->>'name';
    
    -- Get current stock to calculate new stock
    SELECT stock INTO v_current_stock FROM public.products WHERE id = v_product_id;
    v_new_stock := GREATEST(0, v_current_stock - v_quantity);

    -- Update stock
    UPDATE public.products
    SET stock = v_new_stock
    WHERE id = v_product_id;

    -- Insert into inventory logs
    INSERT INTO public.inventory_logs (
      product_id, product_name, change_type, quantity_change, new_stock, user_email, notes
    ) VALUES (
      v_product_id, v_product_name, 'ORDER_PLACED', -v_quantity, v_new_stock, p_email, 'Order #: ' || p_order_number
    );
  END LOOP;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 2. AUTOMATED NOTIFICATIONS FOR ORDER STATUS CHANGES
--    Uses Postgres Triggers to auto-generate notifications
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Insert a notification for the user
    INSERT INTO public.notifications (
      user_id, title, message, type
    ) VALUES (
      NEW.user_id,
      'Order Status Update',
      'Your order ' || NEW.order_number || ' has been updated to: ' || UPPER(NEW.status),
      'order'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists to allow safe re-runs
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_change();


-- ────────────────────────────────────────────────────────────
-- 3. COMPLETE MISSING RLS POLICIES
--    Secures wishlists, reviews, tickets, carts, notifications
-- ────────────────────────────────────────────────────────────
-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── wishlists ──
DROP POLICY IF EXISTS "Users manage their own wishlists" ON public.wishlists;
CREATE POLICY "Users manage their own wishlists"
  ON public.wishlists FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ── reviews ──
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Admin can manage all reviews" ON public.reviews;
CREATE POLICY "Admin can manage all reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND role = 'admin')
  );

-- ── support_tickets ──
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admin full access tickets" ON public.support_tickets;
CREATE POLICY "Admin full access tickets"
  ON public.support_tickets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND role = 'admin')
  );

-- ── abandoned_carts ──
DROP POLICY IF EXISTS "Users manage their abandoned carts" ON public.abandoned_carts;
CREATE POLICY "Users manage their abandoned carts"
  ON public.abandoned_carts FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ── notifications ──
DROP POLICY IF EXISTS "Users view their own notifications" ON public.notifications;
CREATE POLICY "Users view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users update their own notifications" ON public.notifications;
CREATE POLICY "Users update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid()::text = user_id);


-- ────────────────────────────────────────────────────────────
-- 4. VERIFIED BUYER REVIEW SYSTEM (RPC FUNCTION)
--    Safely checks backend if the user actually bought the item
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_verified_review(
  p_product_id UUID,
  p_rating INT,
  p_comment TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id TEXT := auth.uid()::text;
  v_is_verified BOOLEAN := false;
  v_reviewer_name TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be logged in to review';
  END IF;

  -- Check if user has ordered this product
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = v_user_id AND oi.product_id = p_product_id
  ) INTO v_is_verified;

  -- Get user name from profile or default
  SELECT COALESCE(first_name || ' ' || last_name, 'Verified Customer') 
  INTO v_reviewer_name 
  FROM public.profiles 
  WHERE id = v_user_id;

  IF TRIM(v_reviewer_name) = '' THEN
    v_reviewer_name := 'Verified Customer';
  END IF;

  -- Insert review
  INSERT INTO public.reviews (
    user_id, product_id, rating, comment, reviewer_name, is_verified_buyer
  ) VALUES (
    v_user_id, p_product_id, p_rating, p_comment, v_reviewer_name, v_is_verified
  );
END;
$$;
