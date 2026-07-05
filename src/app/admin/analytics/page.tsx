"use client";

import { useEffect, useState } from "react";
import { Eye, Globe, FileText, TrendingUp, Calendar } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

type PageView = {
    id: string;
    path: string;
    locale: string;
    user_agent: string;
    session_id: string;
    created_at: string;
};

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#ec4899"];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [views, setViews] = useState<PageView[]>([]);
    const [totalViews, setTotalViews] = useState(0);
    const [todayViews, setTodayViews] = useState(0);
    const [weekViews, setWeekViews] = useState(0);
    const [uniqueSessions, setUniqueSessions] = useState(0);
    const [viewsByDay, setViewsByDay] = useState<{ date: string; views: number }[]>([]);
    const [topPages, setTopPages] = useState<{ path: string; views: number }[]>([]);
    const [localeData, setLocaleData] = useState<{ name: string; value: number }[]>([]);
    const [tableExists, setTableExists] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            try {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/analytics');
                if (!res.ok) throw new Error("Failed to fetch analytics");
                
                const responseData = await res.json();
                
                if (!responseData.tableExists) {
                    setTableExists(false);
                    setLoading(false);
                    return;
                }

                const data = responseData.data || [];
                const count = responseData.count || data.length;
                const allViews: PageView[] = data || [];
                
                setViews(allViews.slice(0, 100)); // latest 100 for table
                setTotalViews(count || allViews.length);
                const today = new Date().toDateString();
                const todayCount = allViews.filter(
                    (v) => new Date(v.created_at).toDateString() === today
                ).length;
                setTodayViews(todayCount);

                // This week's views
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const weekCount = allViews.filter(
                    (v) => new Date(v.created_at) > oneWeekAgo
                ).length;
                setWeekViews(weekCount);

                // Unique sessions
                const sessions = new Set(allViews.map((v) => v.session_id).filter(Boolean));
                setUniqueSessions(sessions.size);

                // Views by day (last 14 days)
                const dayMap = new Map<string, number>();
                const now = new Date();
                for (let i = 13; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    dayMap.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
                }
                allViews.forEach((v) => {
                    const key = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1);
                });
                setViewsByDay(Array.from(dayMap.entries()).map(([date, views]) => ({ date, views })));

                // Top pages
                const pageMap = new Map<string, number>();
                allViews.forEach((v) => {
                    pageMap.set(v.path, (pageMap.get(v.path) || 0) + 1);
                });
                const sorted = Array.from(pageMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([path, views]) => ({ path, views }));
                setTopPages(sorted);

                // Locale distribution
                const localeMap = new Map<string, number>();
                allViews.forEach((v) => {
                    const loc = v.locale || "en";
                    localeMap.set(loc, (localeMap.get(loc) || 0) + 1);
                });
                setLocaleData(
                    Array.from(localeMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, value]) => ({ name, value }))
                );
            } catch (e) {
                console.error("Failed to load analytics", e);
                setTableExists(false);
            }

            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="h-8 w-48 skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
                </div>
                <div className="h-72 skeleton rounded-2xl" />
            </div>
        );
    }

    if (!tableExists) {
        return (
            <div className="max-w-7xl mx-auto fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={32} className="text-[var(--forest)]" />
                        <h1 className="admin-heading mb-1">
                            Analytics
                        </h1>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-16 text-center z-10 relative">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-sm">
                        <span className="text-4xl">📊</span>
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-3">Analytics Not Set Up</h2>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        Run the <code className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 font-mono border border-green-100/50">step11_analytics_and_logs.sql</code> migration in Supabase to enable visitor tracking and unlock insights.
                    </p>
                </div>
            </div>
        );
    }

    const stats = [
        { title: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "var(--forest)", bg: "var(--forest-light)" },
        { title: "Today", value: todayViews.toLocaleString(), icon: Calendar, color: "#16a34a", bg: "#dcfce7" },
        { title: "This Week", value: weekViews.toLocaleString(), icon: TrendingUp, color: "#d97706", bg: "#fef3c7" },
        { title: "Unique Sessions", value: uniqueSessions.toLocaleString(), icon: Globe, color: "#2563eb", bg: "#dbeafe" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8 fade-in">
                <div className="flex items-center gap-3">
                    <TrendingUp size={32} className="text-[var(--forest)]" />
                    <div>
                        <h1 className="admin-heading mb-1">
                            Analytics Overview
                        </h1>
                        <p className="text-[13px] text-gray-500 uppercase tracking-wide font-medium">Visitor traffic and engagement insights</p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                    <div key={idx} className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 fade-in fade-in-delay-${idx + 1} hover:bg-white/90 transition-all group`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
                                <s.icon size={20} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif font-semibold text-gray-900 mb-0.5">{s.value}</p>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{s.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Views Over Time Chart */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 fade-in relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl font-semibold text-gray-900">Views Over Time (14 Days)</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={viewsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--forest)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--forest)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                            <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid #f1f5f9", borderRadius: 16, fontSize: 12, color: "#1e293b", boxShadow: "0 10px 25px -5px rgba(20, 58, 42, 0.1)" }} />
                            <Area type="monotone" dataKey="views" stroke="var(--forest)" strokeWidth={3} fillOpacity={1} fill="url(#viewsGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 fade-in relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50">
                            <FileText size={18} />
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-gray-900">Top Pages</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        {topPages.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topPages} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="path" type="category" width={140} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid #f1f5f9", borderRadius: 16, fontSize: 12, color: "#1e293b", boxShadow: "0 10px 25px -5px rgba(20, 58, 42, 0.1)" }} />
                                    <Bar dataKey="views" fill="var(--forest)" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <FileText size={20} className="text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">No page views recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Locale Distribution */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 fade-in relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/50">
                            <Globe size={18} />
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-gray-900">Language Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {localeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={localeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {localeData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid #f1f5f9", borderRadius: 16, fontSize: 12, color: "#1e293b", boxShadow: "0 10px 25px -5px rgba(20, 58, 42, 0.1)" }} itemStyle={{ color: '#1e293b' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <Globe size={20} className="text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">No locale data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Views Table */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl overflow-hidden fade-in relative z-10">
                <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-serif text-xl font-semibold text-gray-900">Recent Page Views</h3>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">Last 100</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Path</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Locale</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Session</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {views.slice(0, 25).map((v) => (
                                <tr key={v.id} className="hover:bg-white/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900 group-hover:text-[var(--forest-dark)] transition-colors">{v.path}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100/80 text-gray-600 rounded-full text-[11px] font-bold uppercase tracking-wider border border-gray-200/60">{v.locale || "en"}</span>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-gray-400 hidden sm:table-cell font-mono">
                                        {(v.session_id || "—").slice(0, 8)}…
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-gray-500 text-right">
                                        {new Date(v.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                </tr>
                            ))}
                            {views.length === 0 && (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="py-16 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                <Eye size={24} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium mb-1">No views recorded yet</h3>
                                            <p className="text-gray-500 text-sm">Browse the frontend to generate data.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
