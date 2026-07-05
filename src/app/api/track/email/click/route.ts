import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get("url");
    const email = url.searchParams.get("email") || "unknown";
    const campaign = url.searchParams.get("c") || "default";

    if (!targetUrl) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    try {
        // Get request metadata
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        const supabase = await createServerSupabaseClient();
        
        await supabase.from("email_analytics").insert({
            email: email,
            campaign_name: campaign,
            event_type: 'click',
            link_clicked: targetUrl,
            ip_address: ip,
            user_agent: userAgent
        });

    } catch (e) {
        console.error("Tracking click error", e);
    }

    // Redirect to the actual destination
    return NextResponse.redirect(targetUrl);
}
