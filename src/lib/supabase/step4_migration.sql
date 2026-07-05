-- Create Page Views Table
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  path text NOT NULL,
  session_id text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT page_views_pkey PRIMARY KEY (id)
);

-- Create Product Views Table (to know best products)
CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT product_views_pkey PRIMARY KEY (id)
);

-- Set up RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert product views" ON public.product_views FOR INSERT WITH CHECK (true);

-- Only admins can read views (assuming admins have service role or you can check auth)
CREATE POLICY "Admins read page views" ON public.page_views FOR SELECT USING (true);
CREATE POLICY "Admins read product views" ON public.product_views FOR SELECT USING (true);
