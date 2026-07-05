import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase
            .from("admin_action_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200);

        if (error) {
            if (error.message.includes("does not exist") || error.code === "42P01") {
                return NextResponse.json({ tableExists: false, data: [] });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ tableExists: true, data: data || [] });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
