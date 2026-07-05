import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase.from('coupons').insert([payload]).select();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: "This promo code already exists!" }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data[0]);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { id, is_active } = body;

        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.from('coupons').update({ is_active }).eq('id', id).select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.from('coupons').delete().eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
