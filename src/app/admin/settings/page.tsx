"use client";

import { useState, useEffect } from "react";
import { Settings, ShieldAlert, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        cod_enabled: true,
        maintenance_mode: false,
        shipping_fee: 100,
        free_shipping_threshold: 500
    });

    // Fetch initial settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/settings');
                if (!res.ok) throw new Error("Failed to load settings");
                const data = await res.json();
                if (data) {
                    setSettings({
                        cod_enabled: data.cod_enabled,
                        maintenance_mode: data.maintenance_mode,
                        shipping_fee: data.shipping_fee ?? 100,
                        free_shipping_threshold: data.free_shipping_threshold ?? 500
                    });
                }
            } catch (e) {
                toast.error("Failed to load settings");
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const toggleSetting = async (key: keyof typeof settings) => {
        setIsSaving(true);
        const newValue = !settings[key];

        // Optimistic UI Update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: newValue })
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success(`Setting updated successfully`);
        } catch (e) {
            toast.error("Failed to update settings");
            console.error(e);
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
        setIsSaving(false);
    };

    const updateNumericSetting = async (key: 'shipping_fee' | 'free_shipping_threshold', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) return;

        setSettings(prev => ({ ...prev, [key]: numValue }));

        setIsSaving(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: numValue })
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success(`Updated successfully`);
        } catch (e) {
            toast.error(`Failed to update ${key.replace(/_/g, ' ')}`);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-12 w-64 bg-white/40 animate-pulse rounded-xl mb-8"></div>
                <div className="h-24 bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
                <div className="h-48 bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
                <div className="h-24 bg-white/40 animate-pulse rounded-2xl border border-white/60"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="fade-in mb-8">
                <h1 className="admin-heading mb-1">
                    Platform Settings
                </h1>
            </div>

            <div className="space-y-6 fade-in fade-in-delay-1">

                {/* COD Toggle */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10 transition-all hover:bg-white/90">
                    <div className="flex gap-5 items-start">
                        <div className="p-3.5 rounded-2xl mt-1 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-sm border border-green-200/50">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-gray-900">Cash on Delivery (COD)</h2>
                            <p className="text-[13px] mt-1.5 text-gray-500">Allow customers to choose COD during checkout. If disabled, prepayments are forced.</p>
                        </div>
                    </div>

                    <label className={`relative inline-flex items-center cursor-pointer ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input type="checkbox" className="sr-only peer" checked={settings.cod_enabled} onChange={() => toggleSetting('cod_enabled')} disabled={isSaving} />
                        <div className="w-14 h-7 bg-gray-200/80 backdrop-blur-sm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm" style={settings.cod_enabled ? { background: "var(--forest)" } : {}}></div>
                        <span className="ml-3 text-[13px] font-semibold tracking-wide w-16 text-gray-700 uppercase">
                            {settings.cod_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </label>
                </div>

                {/* Shipping Settings */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 flex flex-col gap-8 relative z-10 transition-all hover:bg-white/90">
                    <div className="flex gap-5 items-start">
                        <div className="p-3.5 rounded-2xl mt-1 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 shadow-sm border border-orange-200/50">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-gray-900">Delivery & Shipping Cost</h2>
                            <p className="text-[13px] mt-1.5 text-gray-500">Configure variable or flat-rate shipping criteria.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Standard Shipping Fee (₹)</label>
                            <input
                                type="number"
                                className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all"
                                value={settings.shipping_fee}
                                onChange={(e) => setSettings(prev => ({ ...prev, shipping_fee: parseFloat(e.target.value) || 0 }))}
                                onBlur={(e) => updateNumericSetting('shipping_fee', e.target.value)}
                                min="0"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">Free Delivery Threshold (₹)</label>
                            <input
                                type="number"
                                className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all"
                                value={settings.free_shipping_threshold}
                                onChange={(e) => setSettings(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
                                onBlur={(e) => updateNumericSetting('free_shipping_threshold', e.target.value)}
                                min="0"
                                disabled={isSaving}
                            />
                            <p className="text-[11px] font-medium mt-2 text-gray-400 uppercase tracking-wide">Orders above this subtotal qualify for 0₹ shipping.</p>
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10 transition-all hover:bg-white/90">
                    <div className="flex gap-5 items-start">
                        <div className="p-3.5 rounded-2xl mt-1 bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-sm border border-red-200/50">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-gray-900">Maintenance Mode</h2>
                            <p className="text-[13px] mt-1.5 text-gray-500">Temporarily take the store offline. Customers will see a &quot;We&apos;ll be right back&quot; banner.</p>
                        </div>
                    </div>
                    <label className={`relative inline-flex items-center cursor-pointer ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input type="checkbox" className="sr-only peer" checked={settings.maintenance_mode} onChange={() => toggleSetting('maintenance_mode')} disabled={isSaving} />
                        <div className="w-14 h-7 bg-gray-200/80 backdrop-blur-sm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm" style={settings.maintenance_mode ? { background: "var(--accent-danger)" } : {}}></div>
                        <span className="ml-3 text-[13px] font-semibold tracking-wide w-16 text-gray-700 uppercase">
                            {settings.maintenance_mode ? 'Offline' : 'Online'}
                        </span>
                    </label>
                </div>

                {/* Database Health */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(20,58,42,0.1)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10 transition-all hover:bg-white/90">
                    <div className="flex gap-5 items-start">
                        <div className="p-3.5 rounded-2xl mt-1 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 shadow-sm border border-gray-200/50">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-gray-900">System Status</h2>
                            <p className="text-[13px] mt-1.5 text-gray-500">Database, Auth, and Storage connection health.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200/60 shadow-sm">
                            Operational
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
