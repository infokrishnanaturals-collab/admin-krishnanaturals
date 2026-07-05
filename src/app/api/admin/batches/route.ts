import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifySessionUser } from '@/lib/firebase/admin';

export async function GET(req: Request) {
    try {
        const sessionUser = await verifySessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createServerSupabaseClient();
        
        const [batchRes, productRes] = await Promise.all([
            supabase.from('batches').select('*, products(name)').order('created_at', { ascending: false }),
            supabase.from('products').select('id, name').order('name')
        ]);

        if (batchRes.error) throw batchRes.error;
        if (productRes.error) throw productRes.error;

        return NextResponse.json({
            batches: batchRes.data || [],
            products: productRes.data || []
        }, { status: 200 });

    } catch (e: any) {
        console.error("Batches GET Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const sessionUser = await verifySessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        const supabase = await createServerSupabaseClient();
        
        const { data, error } = await supabase.from('batches').insert([{
            product_id: body.product_id,
            batch_number: body.batch_number,
            manufacture_date: body.manufacture_date,
            expiry_date: body.expiry_date,
            stock_quantity: body.stock_quantity,
            qr_code_data: body.qr_code_data
        }]).select();

        if (error) throw error;

        return NextResponse.json({ batch: data[0] }, { status: 201 });

    } catch (e: any) {
        console.error("Batches POST Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
