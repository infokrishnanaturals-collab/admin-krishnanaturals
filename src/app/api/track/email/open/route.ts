import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const email = url.searchParams.get("email") || "unknown";
        const campaign = url.searchParams.get("c") || "default";

        // Get request metadata
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        const supabase = await createServerSupabaseClient();
        
        await supabase.from("email_analytics").insert({
            email: email,
            campaign_name: campaign,
            event_type: 'open',
            ip_address: ip,
            user_agent: userAgent
        });

    } catch (e) {
        console.error("Tracking pixel error", e);
    }

    // Return a 1x1 transparent GIF pixel
    const pixel = Buffer.from(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "base64"
    );

    return new NextResponse(pixel, {
        headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    });
}
