-- Increment Coupon Uses safely
CREATE OR REPLACE FUNCTION public.increment_coupon_uses(p_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE code = p_code;
END;
$$;
