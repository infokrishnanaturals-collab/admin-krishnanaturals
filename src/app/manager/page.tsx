import { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { verifySessionUser, isAdminEmail } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Manager Dashboard — Krishna Naturals" };

async function getManagerStats() {
    const supabase = await createServerSupabaseClient();
    const [{ data: pendingOrders }, { data: lowStock }] = await Promise.all([
        supabase.from("orders").select("*").eq("status", "pending").limit(5),
        supabase.from("products").select("*").lt("stock", 10).eq("is_active", true),
    ]);
    return { pendingOrders: pendingOrders || [], lowStock: lowStock || [] };
}

export default async function ManagerDashboard() {
    const sessionUser = await verifySessionUser();
    if (!sessionUser || !isAdminEmail(sessionUser.email)) {
        redirect("/auth/login");
    }

    const { pendingOrders, lowStock } = await getManagerStats();

    return (
        <div style={{ paddingTop: "5rem", minHeight: "100vh", background: "var(--gray-50)" }}>
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest-dark)" }}>Store Manager</h1>
                        <p className="text-sm mt-1" style={{ color: "var(--gray-400)" }}>Manage inventory and orders</p>
                    </div>
                    <Link href="/" className="btn btn-outline text-sm" style={{ padding: "0.5rem 1rem" }}>View Store</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold flex items-center gap-2 text-sm" style={{ color: "var(--forest-dark)" }}>
                                <ShoppingCart size={16} /> Pending Orders
                            </h2>
                            <Link href="/manager/orders" className="text-xs font-bold" style={{ color: "var(--forest)" }}>View All →</Link>
                        </div>
                        {pendingOrders.length === 0 ? (
                            <p className="text-sm py-10 text-center" style={{ color: "var(--gray-300)" }}>No pending orders 🎉</p>
                        ) : (
                            <div className="space-y-2.5">
                                {pendingOrders.map((o) => (
                                    <div key={o.id} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: "var(--cream)" }}>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: "var(--forest-dark)" }}>#{o.order_number}</p>
                                            <p className="text-xs" style={{ color: "var(--gray-400)" }}>₹{o.total}</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: "var(--honey-glow)", color: "var(--gold-dark)" }}>
                                            Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold flex items-center gap-2 text-sm" style={{ color: "var(--forest-dark)" }}>
                                <AlertTriangle size={16} style={{ color: "var(--honey)" }} /> Low Stock Alerts
                            </h2>
                            <Link href="/manager/inventory" className="text-xs font-bold" style={{ color: "var(--forest)" }}>Manage →</Link>
                        </div>
                        {lowStock.length === 0 ? (
                            <p className="text-sm py-10 text-center" style={{ color: "var(--gray-300)" }}>All stock levels healthy ✅</p>
                        ) : (
                            <div className="space-y-2.5">
                                {lowStock.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: "var(--cream)" }}>
                                        <p className="text-sm font-bold" style={{ color: "var(--forest-dark)" }}>{p.name}</p>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}>
                                            {p.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
