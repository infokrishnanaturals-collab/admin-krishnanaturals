import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        // Enforce authentication via Session or API Secret
        const authHeader = req.headers.get('authorization');
        const apiSecret = process.env.ADMIN_API_SECRET;
        const isSecretValid = apiSecret && authHeader === `Bearer ${apiSecret}`;

        if (!isSecretValid) {
            const sessionUser = await verifySessionUser();
            if (!sessionUser) {
                return NextResponse.json({ success: false, error: "Unauthorized: Session required" }, { status: 401 });
            }
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const secret = process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere';
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Signature is valid. Order fulfillment is handled by the frontend checkout API.
            return NextResponse.json({ success: true, message: 'Payment verified successfully.' }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid signature. Payment verification failed.' }, { status: 400 });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
