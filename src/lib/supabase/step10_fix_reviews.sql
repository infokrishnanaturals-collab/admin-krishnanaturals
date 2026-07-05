-- ============================================================
-- KRISHNA NATURALS — STEP 10: FIX REVIEWS AND ADD SEED DATA
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Update RLS for reviews to allow public inserts
-- Since the application uses Firebase Auth, Supabase auth.uid() is null.
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- 2. Seed 10 realistic reviews for each product
DO $$
DECLARE
    rec RECORD;
    i INT;
    names TEXT[] := ARRAY['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Patel', 'Vikram Desai', 'Anjali Gupta', 'Rohit Verma', 'Sneha Reddy', 'Karan Malhotra', 'Pooja Joshi', 'Aditya R.', 'Shruti M.', 'Suresh K.', 'Meera S.'];
    comments TEXT[] := ARRAY[
        'Absolutely pure and authentic. The taste is incredibly natural and unlike any store-bought honey I have ever tried.',
        'Very high quality product. I use it every morning with warm water and lemon. Highly recommended!',
        'You can really taste the difference. The texture and aroma are perfect. Will definitely buy again.',
        'Great packaging and excellent quality. It feels very raw and unadulterated.',
        'I have tried many brands, but this one stands out. The medicinal value and pure taste make it worth the price.',
        'Fast delivery and genuine product. The consistency is thick and the flavor is rich.',
        '100% natural. My whole family loves it. It has become a staple in our kitchen.',
        'Very premium quality. It crystallizes in cold weather, which is a sign of pure honey. Loved it!',
        'Amazing product! I use it as a natural sweetener for my tea and oats. Tastes divine.',
        'Authentic and raw. I appreciate the transparent sourcing and the ethical practices behind this.'
    ];
BEGIN
    FOR rec IN SELECT id FROM public.products LOOP
        FOR i IN 1..10 LOOP
            INSERT INTO public.reviews (product_id, rating, comment, reviewer_name, is_verified_buyer, created_at)
            VALUES (
                rec.id,
                floor(random() * 2) + 4, -- Rating 4 or 5
                comments[i],
                names[floor(random() * array_length(names, 1)) + 1],
                true,
                NOW() - (random() * interval '60 days')
            );
        END LOOP;
        
        -- Update the product review count
        UPDATE public.products 
        SET review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = rec.id)
        WHERE id = rec.id;
    END LOOP;
END $$;
