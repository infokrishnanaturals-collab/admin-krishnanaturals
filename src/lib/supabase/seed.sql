// This is run manually or via Supabase SQL terminal to insert data.
// We execute this via MCP.

INSERT INTO public.categories (name, slug, description, sort_order)
VALUES 
    ('Small Pack', 'small-pack', 'Perfect for tasting and gifting.', 1),
    ('Family Pack', 'family-pack', 'The perfect size for daily household usage.', 2),
    ('Mega Pack', 'mega-pack', 'Best value for bulk consumption.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Map categories visually
-- Small Pack uuid -> (fetch using subquery)

INSERT INTO public.products (
    category_id, name, slug, short_description, description, weight, price, mrp, stock, images, rating, review_count, is_active, is_featured
)
VALUES 
(
    (SELECT id FROM public.categories WHERE slug = 'small-pack'),
    'Pure Honey - 250g', 'pure-honey-250g', '100% Pure Natural Honey - Small Pack', 
    'Our pure honey is carefully collected from healthy bee colonies in Gujarat. With no additives, no sugar, and no artificial processing, you get honey in its most natural form. Rich in antioxidants and natural enzymes.', 
    '250g', 249.00, 299.00, 100, 
    '["/images/250g/1.png","/images/250g/2.png","/images/250g/3.png","/images/250g/4.png","/images/250g/6.png"]'::jsonb, 
    5.0, 12, true, true
),
(
    (SELECT id FROM public.categories WHERE slug = 'family-pack'),
    'Pure Honey - 500g', 'pure-honey-500g', '100% Pure Natural Honey - Family Pack (Bestseller)', 
    'Our pure honey is carefully collected from healthy bee colonies in Gujarat. With no additives, no sugar, and no artificial processing, you get honey in its most natural form. Rich in antioxidants and natural enzymes.', 
    '500g', 449.00, 549.00, 100, 
    '["/images/500g/1.png","/images/500g/2.png","/images/500g/3.png","/images/500g/4.jpg","/images/500g/5.png","/images/500g/7.png"]'::jsonb, 
    5.0, 34, true, true
),
(
    (SELECT id FROM public.categories WHERE slug = 'mega-pack'),
    'Pure Honey - 1kg', 'pure-honey-1kg', '100% Pure Natural Honey - Mega Pack (Best Value)', 
    'Our pure honey is carefully collected from healthy bee colonies in Gujarat. With no additives, no sugar, and no artificial processing, you get honey in its most natural form. Rich in antioxidants and natural enzymes.', 
    '1kg', 799.00, 999.00, 100, 
    '["/images/1kg/1.png","/images/1kg/2.png","/images/1kg/3.png","/images/1kg/4.png","/images/1kg/6.png"]'::jsonb, 
    4.9, 18, true, true
)
ON CONFLICT (slug) DO NOTHING;
