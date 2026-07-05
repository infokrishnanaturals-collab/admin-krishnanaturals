import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminOrderUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PUT(req: Request) {
    const user = await verifySessionUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const raw = await req.json();
        const parsed = AdminOrderUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid order data", details: parsed.error.flatten() }, { status: 400 });
        }
        const { id: orderId, status, courier_name, tracking_number, tracking_url, ...rest } = parsed.data as {
            id: string; status?: string; courier_name?: string; tracking_number?: string; tracking_url?: string;
        };

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('orders')
            .update({
                status,
                courier_name,
                tracking_number,
                tracking_url
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also fetch the user's email if needed for the response
        if (data && data.user_id) {
            const { data: profile } = await supabase.from('profiles').select('email').eq('id', data.user_id).single();
            if (profile) {
                data.user_email = profile.email;
            }
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const user = await verifySessionUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const raw = await req.json();
        const BulkSchema = z.object({
            orderIds: z.array(z.string().uuid()).min(1),
            status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        });
        const parsed = BulkSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request payload", details: parsed.error.flatten() }, { status: 400 });
        }
        const { orderIds, status } = parsed.data;

        if (!Array.isArray(orderIds) || !status) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .in('id', orderIds);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: orderIds.length });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
