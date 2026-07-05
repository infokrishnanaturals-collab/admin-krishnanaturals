"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Tag, Percent } from "lucide-react";

type Coupon = {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    max_uses: number | null;
    current_uses: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
};

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "0",
        max_uses: "",
    });

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/coupons");
            if (!res.ok) throw new Error("Failed to load coupons");
            const data = await res.json();
            setCoupons(data as Coupon[]);
        } catch (e) {
            toast.error("Failed to load coupons");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = newCoupon.code.toUpperCase().trim();
        if (!code) return toast.error("Code is required");

        const payload = {
            code,
            discount_type: newCoupon.discount_type,
            discount_value: parseFloat(newCoupon.discount_value),
            min_order_amount: parseFloat(newCoupon.min_order_amount) || 0,
            max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
        };

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                if (res.status === 409) toast.error("Coupon code already exists!");
                else toast.error("Failed to create coupon");
            } else {
                toast.success("Coupon created successfully!");
                setShowForm(false);
                setNewCoupon({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", max_uses: "" });
                fetchCoupons();
            }
        } catch (e) {
            toast.error("Failed to create coupon");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/coupons", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_active: !currentStatus })
            });
            if (!res.ok) throw new Error("Update failed");
            fetchCoupons();
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete the coupon.")) return;
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/marketing/coupons?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            fetchCoupons();
        } catch (e) {
            toast.error("Failed to delete coupon");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading coupons...</div>;

    return (
        <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="admin-heading mb-1">
                    Coupon Manager
                </h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="admin-btn-primary flex items-center gap-2 px-4 py-2"
                >
                    <Plus size={18} /> New Coupon
                </button>
            </div>

            {showForm && (
                <div className="admin-panel mb-8 fade-in p-6">
                    <h2 className="font-serif font-semibold text-xl text-gray-900 mb-6">Create New Coupon</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Coupon Code</label>
                            <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" className="w-full admin-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Discount Type</label>
                            <select value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})} className="w-full admin-input">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Discount Value</label>
                            <input required type="number" step="0.01" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: e.target.value})} placeholder="e.g. 20" className="w-full admin-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Minimum Order Amount (₹)</label>
                            <input type="number" step="0.01" value={newCoupon.min_order_amount} onChange={e => setNewCoupon({...newCoupon, min_order_amount: e.target.value})} placeholder="e.g. 1000" className="w-full admin-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Max Uses (Optional)</label>
                            <input type="number" value={newCoupon.max_uses} onChange={e => setNewCoupon({...newCoupon, max_uses: e.target.value})} placeholder="Leave blank for unlimited" className="w-full admin-input" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary px-6 py-2">Cancel</button>
                            <button type="submit" className="admin-btn-primary px-6 py-2">Create Coupon</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-table-container fade-in fade-in-delay-1">
                <table className="admin-table w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 font-semibold">Code</th>
                            <th className="p-4 font-semibold">Value</th>
                            <th className="p-4 font-semibold">Min Order</th>
                            <th className="p-4 font-semibold">Uses</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {coupons.map(coupon => (
                            <tr key={coupon.id}>
                                <td className="p-4 font-bold text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-gray-400" /> {coupon.code}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                </td>
                                <td className="p-4 text-gray-500">₹{coupon.min_order_amount}</td>
                                <td className="p-4 text-gray-500">
                                    {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                                </td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-700 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No coupons found. Create one above!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
