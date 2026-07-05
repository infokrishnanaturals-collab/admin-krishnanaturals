import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifySessionUser } from '@/lib/firebase/admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, userEmail, items } = body;

        if (!userId || !userEmail) {
            return NextResponse.json({ error: "Missing required auth fields" }, { status: 400 });
        }

        // 1. Authenticate user session
        const sessionUser = await verifySessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized: Session required" }, { status: 401 });
        }

        // 2. Validate user identity
        if (sessionUser.uid !== userId) {
            return NextResponse.json({ error: "Forbidden: You cannot modify another user's cart" }, { status: 403 });
        }

        const supabase = await createServerSupabaseClient();

        // Check if there's an existing cart session
        const { data: existing } = await supabase
            .from('abandoned_carts')
            .select('status')
            .eq('user_id', userId)
            .single();

        // If the cart has been 'recovered', we start fresh. If 'sent', we leave it alone or reset it depending on business logic. 
        // For simplicity, we always update it back to pending if they are modifying the cart again.
        const { error } = await supabase.from('abandoned_carts').upsert({
            user_id: userId,
            user_email: userEmail,
            cart_data: items,
            status: 'pending',
            last_updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Failed to sync cart" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // 1. Authenticate user session
        const sessionUser = await verifySessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized: Session required" }, { status: 401 });
        }

        // 2. Validate user identity
        if (sessionUser.uid !== userId) {
            return NextResponse.json({ error: "Forbidden: You cannot modify another user's cart" }, { status: 403 });
        }

        const supabase = await createServerSupabaseClient();

        // Update status to 'recovered' instead of deleting to keep good analytics
        const { error } = await supabase
            .from('abandoned_carts')
            .update({ status: 'recovered' })
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Failed to clear cart sync" }, { status: 500 });
    }
}
