import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createServerSupabaseClient();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
        const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } else {
        const { data, error } = await supabase.from("blogs").select("*").order("published_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }
}

export async function POST(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase.from("blogs").insert([payload]).select();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
        const { id, ...payload } = body;
        if (!id) return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.from("blogs").update(payload).eq("id", id).select().single();
        
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
        if (!id) return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
