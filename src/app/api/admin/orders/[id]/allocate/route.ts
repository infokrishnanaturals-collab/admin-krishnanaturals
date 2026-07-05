import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerSupabaseClient();
        const p = await params;
        const orderId = p.id;

        // 1. Fetch order items that don't have a batch assigned yet
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .is('batch_id', null);

        if (itemsError) throw itemsError;

        if (!orderItems || orderItems.length === 0) {
            return NextResponse.json({ message: "All items are already allocated or no items found" });
        }

        // 2. Allocate batches for each item
        for (const item of orderItems) {
            // Find oldest batch with available stock for this product
            const { data: batches, error: batchError } = await supabase
                .from('batches')
                .select('*')
                .eq('product_id', item.product_id)
                .order('created_at', { ascending: true })
                .gt('stock_quantity', 0)
                .limit(1);
            
            if (batchError) {
                console.error("Error fetching batches:", batchError);
                continue;
            }

            // If no batch has >0 stock, fallback to the absolute oldest batch regardless of stock
            let targetBatch = batches?.[0];
            if (!targetBatch) {
                const { data: fallbackBatches } = await supabase
                    .from('batches')
                    .select('*')
                    .eq('product_id', item.product_id)
                    .order('created_at', { ascending: true })
                    .limit(1);
                targetBatch = fallbackBatches?.[0];
            }

            if (targetBatch) {
                // Deduct stock
                await supabase
                    .from('batches')
                    .update({ stock_quantity: targetBatch.stock_quantity - item.quantity })
                    .eq('id', targetBatch.id);

                // Update order item with batch assignment
                await supabase
                    .from('order_items')
                    .update({ 
                        batch_id: targetBatch.id,
                        batch_number: targetBatch.batch_number
                    })
                    .eq('id', item.id);
            }
        }

        return NextResponse.json({ success: true, message: "Batches allocated successfully" });
    } catch (e: any) {
        console.error("Allocation Error:", e);
        return NextResponse.json({ error: e.message || "Failed to allocate batches" }, { status: 500 });
    }
}
