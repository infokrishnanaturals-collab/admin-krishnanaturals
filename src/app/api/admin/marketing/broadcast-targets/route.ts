import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const supabase = await createServerSupabaseClient();
        
        const { data: profiles, error: profileErr } = await supabase.from('profiles').select('email').not('email', 'is', null);
        const { data: subs, error: subErr } = await supabase.from('newsletter_subscribers').select('email');

        if ((profileErr || !profiles) && (subErr || !subs)) {
             return NextResponse.json({ error: "Could not find any target emails." }, { status: 404 });
        }

        const emails = new Set<string>();
        profiles?.forEach(p => p.email && emails.add(p.email.trim().toLowerCase()));
        subs?.forEach(s => s.email && emails.add(s.email.trim().toLowerCase()));

        return NextResponse.json(Array.from(emails));
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
