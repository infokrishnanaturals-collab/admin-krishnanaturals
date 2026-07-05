-- ============================================================
-- KRISHNA NATURALS — PHASE 10: EMAIL ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    campaign_name TEXT,
    event_type TEXT NOT NULL, -- 'open' or 'click'
    link_clicked TEXT, -- only for clicks
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Admin only for reading)
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email analytics" ON public.email_analytics;
CREATE POLICY "Admins can view email analytics" 
ON public.email_analytics FOR SELECT 
USING (auth.email() IN ('info.krishnanaturals@gmail.com', 'veer.b.builds@gmail.com'));

-- Allow insert from anon (since these are tracked via public GET requests from email clients)
DROP POLICY IF EXISTS "Public can insert analytics" ON public.email_analytics;
CREATE POLICY "Public can insert analytics" 
ON public.email_analytics FOR INSERT 
WITH CHECK (true);
