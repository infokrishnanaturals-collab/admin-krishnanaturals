import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, actor_email, details } = body;

        const supabase = await createServerSupabaseClient();
        
        // Use service role if needed, or anon key. The policy allows anyone to insert.
        // But since we are on the server, createServerSupabaseClient might fail if no cookies?
        // Wait, createServerSupabaseClient uses the service role key if available.

        // Get IP for audit
        const ip_address = req.headers.get("x-forwarded-for") || "unknown";

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                action,
                actor_email,
                details,
                ip_address,
                status: 'failure'
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Audit Log Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
