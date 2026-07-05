-- Step 12: Dynamic Content for Frontend Pages
-- This migration creates the `frontend_pages` table and adds `image_url` to `categories`.

-- 1. Add image_url to categories if it doesn't exist
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create frontend_pages table for dynamic Terms, Privacy, Refund policies
CREATE TABLE IF NOT EXISTS public.frontend_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Storing HTML or Markdown
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for frontend_pages
ALTER TABLE public.frontend_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read frontend pages
CREATE POLICY "Public can read frontend pages" ON public.frontend_pages 
FOR SELECT USING (true);

-- Only admins can insert/update/delete frontend pages
CREATE POLICY "Admins can insert frontend pages" ON public.frontend_pages 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin')
);

CREATE POLICY "Admins can update frontend pages" ON public.frontend_pages 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin')
);

CREATE POLICY "Admins can delete frontend pages" ON public.frontend_pages 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin')
);

-- Insert placeholder dynamic pages
INSERT INTO public.frontend_pages (slug, title, content)
VALUES 
('terms', 'Terms of Service', '<p>Welcome to Krishna Naturals. These are our terms of service.</p>'),
('privacy', 'Privacy Policy', '<p>Your privacy is important to us. We securely store your data and do not share it.</p>'),
('refund-policy', 'Refund Policy', '<p>We offer a 7-day refund policy for damaged goods.</p>')
ON CONFLICT (slug) DO NOTHING;
