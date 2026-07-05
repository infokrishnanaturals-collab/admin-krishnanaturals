import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
});

export async function POST(req: Request) {
    try {
        // Enforce authentication via Session or API Secret
        const authHeader = req.headers.get('authorization');
        const apiSecret = process.env.ADMIN_API_SECRET;
        const isSecretValid = apiSecret && authHeader === `Bearer ${apiSecret}`;

        if (!isSecretValid) {
            const sessionUser = await verifySessionUser();
            if (!sessionUser) {
                return NextResponse.json({ error: "Unauthorized: Session required" }, { status: 401 });
            }
        }

        const { cartItems } = await req.json();

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        
        // Securely fetch prices from the database
        const itemIds = cartItems.map(item => item.id);
        const { data: products, error: dbError } = await supabase
            .from('products')
            .select('id, price')
            .in('id', itemIds);

        if (dbError || !products) {
            console.error("Database error verifying products:", dbError);
            return NextResponse.json({ error: "Failed to verify products", details: dbError?.message }, { status: 500 });
        }

        // Calculate total on the backend
        let calculatedTotal = 0;
        for (const item of cartItems) {
            const dbProduct = products.find(p => p.id === item.id);
            if (dbProduct) {
                calculatedTotal += dbProduct.price * item.quantity;
            }
        }

        // Add shipping fee if applicable (e.g. 50 if below 500)
        if (calculatedTotal < 500) {
            calculatedTotal += 50;
        }

        const options = {
            amount: calculatedTotal * 100, // Razorpay amount is in paise
            currency: "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }
}
