import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase
            .from("support_tickets")
            .select(`
                *,
                admin_profiles:assigned_profile_id(name, email:name),
                ticket_messages(*)
            `)
            .order("created_at", { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { id, status } = body;
        if (!id || !status) return NextResponse.json({ error: "ID and status are required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.from("support_tickets").update({ status }).eq("id", id).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { ticket_id, message } = body;
        if (!ticket_id || !message) return NextResponse.json({ error: "Ticket ID and message are required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        
        // Save reply
        const { error: msgError } = await supabase
            .from("ticket_messages")
            .insert({
                ticket_id,
                sender_type: 'admin',
                message
            });

        if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

        // Update ticket status
        await supabase.from("support_tickets").update({ status: 'replied' }).eq("id", ticket_id);
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
