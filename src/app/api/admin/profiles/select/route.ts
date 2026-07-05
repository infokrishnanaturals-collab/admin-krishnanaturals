import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { profileId } = body;

        if (!profileId) {
            return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
        }

        const cookieStore = await cookies();
        cookieStore.set("active_profile_id", profileId, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
