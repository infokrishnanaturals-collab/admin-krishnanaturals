import { NextResponse } from 'next/server';
import { verifySessionUser } from '@/lib/firebase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const user = await verifySessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const supabase = await createServerSupabaseClient();
        
        // Fetch Orders
        const { data: orders } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        // Fetch Customers Count
        const { count: customerCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // Fetch Page Views Count
        let pageViewCount = 0;
        try {
            const { count } = await supabase
                .from("page_views")
                .select("*", { count: "exact", head: true });
            pageViewCount = count || 0;
        } catch {
            // Ignore if table doesn't exist
        }

        // Fetch Low Stock Products
        const { data: lowStockProducts } = await supabase
            .from("products")
            .select("id, name, stock")
            .lte("stock", 5)
            .order("stock", { ascending: true });

        return NextResponse.json({
            orders: orders || [],
            customerCount: customerCount || 0,
            pageViewCount,
            lowStockProducts: lowStockProducts || []
        });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
