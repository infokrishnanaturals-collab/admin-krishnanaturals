-- Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_active boolean DEFAULT true,
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id)
);

-- Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT null,
  current_uses integer DEFAULT 0,
  valid_from timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);

-- Create Wholesale Inquiries Table
CREATE TABLE IF NOT EXISTS public.wholesale_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  estimated_volume text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wholesale_inquiries_pkey PRIMARY KEY (id)
);

-- Create Return Requests Table
CREATE TABLE IF NOT EXISTS public.return_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  order_number text NOT NULL,
  reason text NOT NULL,
  description text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT return_requests_pkey PRIMARY KEY (id)
);

-- Create Product FAQs Table
CREATE TABLE IF NOT EXISTS public.product_faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id text,
  user_name text NOT NULL,
  question text NOT NULL,
  answer text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  answered_at timestamp with time zone,
  CONSTRAINT product_faqs_pkey PRIMARY KEY (id)
);

-- Set up RLS for new tables
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;

-- Public read access for active coupons and published FAQs
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published faqs" ON public.product_faqs FOR SELECT USING (is_published = true);

-- Anyone can insert into newsletter, wholesale, and faqs
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit wholesale" ON public.wholesale_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can ask question" ON public.product_faqs FOR INSERT WITH CHECK (true);

-- Authenticated users can insert and read their own return requests
CREATE POLICY "Users can create return requests" ON public.return_requests FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can read own return requests" ON public.return_requests FOR SELECT USING (auth.uid()::text = user_id);
