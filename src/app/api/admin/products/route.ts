import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductCreateSchema, ProductUpdateSchema } from '@/lib/validations';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createServerSupabaseClient();
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
        const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } else {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }
}

export async function POST(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const raw = await req.json();
        const parsed = ProductCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
        }
        const payload = parsed.data;
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase.from("products").insert([payload]).select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        if (data && data[0]) {
            await supabase.from("inventory_logs").insert([{
                product_id: data[0].id,
                product_name: payload.name,
                change_type: 'CREATED',
                quantity_change: payload.stock,
                new_stock: payload.stock,
                user_email: user.email || 'Admin',
                notes: 'New Product Registered in system'
            }]);
        }

        return NextResponse.json(data[0]);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const raw = await req.json();
        const parsed = ProductUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
        }
        const { id, originalStock, ...payload } = parsed.data;
        
        if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.from("products").update(payload).eq("id", id).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        await supabase.from("inventory_logs").insert([{
            product_id: id,
            product_name: payload.name,
            change_type: 'MANUAL_RESTOCK',
            quantity_change: (payload.stock as number) - (originalStock || (payload.stock as number)),
            new_stock: payload.stock as number,
            user_email: user.email || 'Admin',
            notes: 'Admin updated product stock/details via Dashboard'
        }]);

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        const name = url.searchParams.get("name");

        if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        await supabase.from("inventory_logs").insert([{
            product_id: null,
            product_name: name || 'Unknown Product',
            change_type: 'DELETED',
            quantity_change: 0,
            new_stock: 0,
            user_email: user.email || 'Admin',
            notes: 'Product deleted from system'
        }]);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
