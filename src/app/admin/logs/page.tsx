"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

type LogEntry = {
    id: string;
    action: string;
    details: Record<string, unknown>;
    admin_email: string;
    created_at: string;
};

const actionColors: Record<string, string> = {
    create: "badge-success",
    update: "badge-info",
    delete: "badge-danger",
    edit: "badge-warning",
    login: "badge-primary",
};

function getActionBadge(action: string) {
    const lower = action.toLowerCase();
    for (const key of Object.keys(actionColors)) {
        if (lower.includes(key)) return actionColors[key];
    }
    return "badge-neutral";
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/logs");
                if (!res.ok) throw new Error("Failed to fetch logs");
                
                const responseData = await res.json();
                
                if (!responseData.tableExists) {
                    setTableExists(false);
                    setLoading(false);
                    return;
                }
                
                setLogs(responseData.data || []);
            } catch (e) {
                setTableExists(false);
            }
            setLoading(false);
        }
        fetchLogs();
         
    }, []);

    const filteredLogs = logs.filter(
        (l) =>
            l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.admin_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-8 w-48 skeleton" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!tableExists) {
        return (
            <div className="max-w-5xl mx-auto">
                <h1 className="admin-heading mb-2">
                    Activity Logs
                </h1>
                <div className="admin-panel p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="empty-state">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-xl font-bold text-gray-900 mb-2">Logs Not Set Up</p>
                        <p className="text-sm text-gray-500">
                            Run the <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-[var(--forest)]">step11_analytics_and_logs.sql</code> migration in Supabase to enable activity logging.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="fade-in">
                <h1 className="admin-heading">
                    Activity Logs
                </h1>
                <p className="admin-subheading mt-0.5">
                    Audit trail of all admin actions
                </p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 fade-in">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by action or admin email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-input pl-10"
                    />
                </div>
                <button className="admin-btn admin-btn-secondary">
                    <Filter size={14} />
                    Filter
                </button>
            </div>

            {/* Logs Timeline */}
            <div className="space-y-2 fade-in">
                {filteredLogs.length === 0 ? (
                    <div className="admin-panel p-12 text-center border-2 border-dashed border-gray-200 text-gray-400">
                        <div className="empty-state">
                            <Activity size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="text-xl font-bold text-gray-900 mb-2">No activity yet</p>
                            <p className="text-sm text-gray-500">Admin actions will be logged here automatically.</p>
                        </div>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className="admin-panel transition-all duration-200 cursor-pointer"
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        >
                            <div className="flex items-center gap-4 p-4">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--forest-light)]"
                                >
                                    <Activity size={16} className="text-[var(--forest)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`badge ${getActionBadge(log.action)}`}>{log.action}</span>
                                        <span className="text-xs text-gray-500">
                                            by {log.admin_email}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock size={12} />
                                        {new Date(log.created_at).toLocaleString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                    {expandedId === log.id ? (
                                        <ChevronUp size={14} className="text-gray-500" />
                                    ) : (
                                        <ChevronDown size={14} className="text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === log.id && log.details && Object.keys(log.details).length > 0 && (
                                <div
                                    className="px-4 pb-4 border-t border-gray-100"
                                >
                                    <pre
                                        className="mt-3 p-3 rounded-lg text-xs overflow-x-auto bg-gray-50 text-gray-600 border border-gray-100"
                                    >
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
