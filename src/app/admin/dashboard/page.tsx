"use client";

import { useEffect, useState } from "react";
import {
    DollarSign,
    ShoppingBag,
    Users,
    TrendingUp,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Package,
    ChevronRight
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Link from "next/link";

type Order = {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total: string;
    shipping_name: string;
};

type RevenuePoint = {
    date: string;
    revenue: number;
    orders: number;
};

const statusColors: Record<string, string> = {
    delivered: "bg-green-50 text-green-700 border-green-200",
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        weeklyOrders: 0,
        customers: 0,
        pageViews: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<{id: string, name: string, stock: number}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);

            try {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/dashboard');
                if (res.status === 401) {
                    window.location.href = '/auth/login?session=expired';
                    return;
                }
                if (!res.ok) throw new Error("Failed to fetch");
                
                const { orders, customerCount, pageViewCount, lowStockProducts } = await res.json();
                
                if (lowStockProducts) {
                    setLowStockAlerts(lowStockProducts);
                }

            if (orders) {
                const revenue = orders
                    .filter((o: any) => o.status !== "cancelled")
                    .reduce((sum: number, order: any) => sum + parseFloat(order.total || "0"), 0);

                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const weekly = orders.filter(
                    (o: any) => new Date(o.created_at) > oneWeekAgo
                ).length;

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orders.length,
                    weeklyOrders: weekly,
                    customers: customerCount || 0,
                    pageViews: pageViewCount,
                });

                setRecentOrders(orders.slice(0, 8));

                const chartMap = new Map<string, { revenue: number; orders: number }>();
                const now = new Date();
                for (let i = 13; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    chartMap.set(key, { revenue: 0, orders: 0 });
                }

                orders.forEach((order: any) => {
                    const d = new Date(order.created_at);
                    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    if (chartMap.has(key)) {
                        const existing = chartMap.get(key)!;
                        existing.revenue += parseFloat(order.total || "0");
                        existing.orders += 1;
                    }
                });

                setRevenueData(
                    Array.from(chartMap.entries()).map(([date, data]) => ({
                        date,
                        revenue: Math.round(data.revenue),
                        orders: data.orders,
                    }))
                );
            }
            } catch (e) {
                console.error("Dashboard analytics failed to load", e);
            }

            setLoading(false);
        }

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-xl w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-gray-100 shadow-sm" />
                    <div className="h-96 bg-white rounded-2xl border border-gray-100 shadow-sm" />
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
            icon: DollarSign,
            trend: "+12.5%",
            trendUp: true,
            color: "text-green-700",
            bg: "bg-green-50",
            border: "border-green-100"
        },
        {
            title: "Total Orders",
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            trend: `+${stats.weeklyOrders} this week`,
            trendUp: true,
            color: "text-[var(--gold-dark)]",
            bg: "bg-[var(--gold-muted)]",
            border: "border-[var(--gold-light)]"
        },
        {
            title: "Total Customers",
            value: stats.customers.toLocaleString(),
            icon: Users,
            trend: "+3.2%",
            trendUp: true,
            color: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "Page Views",
            value: stats.pageViews.toLocaleString(),
            icon: Eye,
            trend: "+28.4%",
            trendUp: true,
            color: "text-purple-700",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--forest-dark)] font-serif mb-1">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-gray-500">
                        Welcome back! Here's what's happening with your store today.
                    </p>
                </div>
                <Link href="/admin/orders" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--forest)] text-white text-sm font-bold rounded-xl hover:bg-[var(--forest-light)] transition-colors shadow-md shadow-[var(--forest-muted)]">
                    <Package size={16} />
                    Manage Orders
                </Link>
            </div>

            {/* Low Stock Alerts */}
            {lowStockAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h3 className="text-red-800 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            Low Stock Alert
                        </h3>
                        <p className="text-red-600 text-sm mt-1">
                            {lowStockAlerts.length} product(s) are running extremely low on stock.
                        </p>
                    </div>
                    <Link href="/admin/products" className="shrink-0 bg-red-100 hover:bg-red-200 text-red-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
                        Restock Now
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border ${stat.border}`}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 font-serif">Revenue Over Time</h2>
                            <p className="text-xs text-gray-500">Last 14 days performance</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <div className="w-3 h-3 rounded-full bg-[var(--forest)] opacity-80" />
                                Revenue
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--forest)" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="var(--forest)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'var(--forest-dark)', fontWeight: 'bold' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`₹${value || 0}`, "Revenue"]}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="var(--forest)" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--gold)" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 font-serif">Recent Orders</h2>
                            <p className="text-xs text-gray-500">Latest transactions</p>
                        </div>
                        <Link href="/admin/orders" className="text-xs font-bold text-[var(--gold-dark)] hover:text-[var(--forest)] flex items-center gap-1 transition-colors">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {recentOrders.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                                <Package size={32} className="mb-2 text-gray-400" />
                                <p className="text-sm font-medium text-gray-500">No recent orders found</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[var(--forest)] font-bold text-sm shrink-0">
                                                {(order.shipping_name || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {order.shipping_name || "Customer"}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-medium text-[var(--forest)]">#{order.order_number}</span>
                                                    <span>•</span>
                                                    <span className="truncate">{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-sm font-extrabold text-gray-900 mb-1">
                                                ₹{parseFloat(order.total || "0").toLocaleString("en-IN")}
                                            </p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status.toLowerCase()] || statusColors.pending}`}>
                                                {order.status}
                                            </span>
                                        </div>
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
