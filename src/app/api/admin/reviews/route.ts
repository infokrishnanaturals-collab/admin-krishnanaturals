import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase
            .from("reviews")
            .select(`*, products:product_id(name)`)
            .order("created_at", { ascending: false });

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
        if (!id) return NextResponse.json({ error: "Review ID is required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.from("reviews").delete().eq("id", id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
