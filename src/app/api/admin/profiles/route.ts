import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        
        // Fetch profiles sorted by name
        const { data: profiles, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ profiles: profiles || [] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
