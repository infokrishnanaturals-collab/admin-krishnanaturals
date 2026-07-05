"use client";

import { useState, useEffect } from "react";
import { Tag, Link as LinkIcon, Plus, Trash2, CheckCircle, Percent, Banknote, Mail, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Coupon = {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_value: number;
    is_active: boolean;
};

export default function AdminMarketingPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [discountValue, setDiscountValue] = useState(10);
    const [minOrder, setMinOrder] = useState(500);

    const [emailSubject, setEmailSubject] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailProgress, setEmailProgress] = useState({ total: 0, sent: 0, current: "" });

    // Newsletter Subscribers State
    const [subscribers, setSubscribers] = useState<{ id: string; email: string; created_at: string }[]>([]);

    useEffect(() => {
        fetchCoupons();
        fetchSubscribers();
    }, []);

    const fetchCoupons = async () => {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/coupons");
        if (res.ok) {
            const data = await res.json();
            setCoupons(data);
        }
    };

    const fetchSubscribers = async () => {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/subscribers");
        if (res.ok) {
            const data = await res.json();
            setSubscribers(data);
        }
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (!confirm("Are you sure you want to remove this subscriber?")) return;
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/marketing/subscribers?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success("Subscriber removed successfully");
            fetchSubscribers();
        } else {
            toast.error("Failed to remove subscriber");
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode.trim() || discountValue <= 0) {
            toast.error("Please fill all fields correctly");
            return;
        }

        setIsGenerating(true);
        const code = newCode.toUpperCase().trim();

        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/coupons", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                discount_type: discountType,
                discount_value: discountValue,
                min_order_value: minOrder,
            })
        });

        setIsGenerating(false);

        if (!res.ok) {
            if (res.status === 409) {
                toast.error("This promo code already exists!");
            } else {
                toast.error("Failed to create code");
            }
        } else {
            toast.success("Promo code created!");
            setNewCode("");
            setDiscountValue(10);
            fetchCoupons();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/marketing/coupons", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: !currentStatus })
        });
        if (res.ok) {
            toast.success(currentStatus ? "Coupon Disabled" : "Coupon Activated");
            fetchCoupons();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/marketing/coupons?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success("Coupon deleted permanently");
            fetchCoupons();
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject.trim() || !emailContent.trim()) {
            toast.error("Subject and message are required.");
            return;
        }

        if (!confirm("Are you absolutely sure you want to broadcast this to ALL registered customers and newsletter subscribers?")) return;

        setIsSendingEmail(true);

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/marketing/broadcast-targets');
            if (!res.ok) {
                toast.error("Could not find any target emails.");
                setIsSendingEmail(false);
                return;
            }

            const targetEmails = await res.json();

            if (!Array.isArray(targetEmails) || targetEmails.length === 0) {
                toast.error("No target emails found.");
                setIsSendingEmail(false);
                return;
            }

            const total = targetEmails.length;
            setEmailProgress({ total, sent: 0, current: "" });

            let successCount = 0;

            // 2. Broadcast sequentially to avoid rate limits
            for (let i = 0; i < targetEmails.length; i++) {
                const target = targetEmails[i];
                setEmailProgress({ total, sent: i, current: target });

                try {
                    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: target,
                            type: 'MARKETING_BROADCAST',
                            payload: {
                                subject: emailSubject,
                                markdownContent: emailContent
                            }
                        })
                    });

                    if (res.ok) successCount++;
                } catch (err) {
                    console.error(`Failed to send to ${target}`, err);
                }

                // Artificial delay to prevent aggressive rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            toast.success(`Successfully sent ${successCount} out of ${total} emails!`);
            setEmailSubject("");
            setEmailContent("");
        } catch (err) {
            console.error("Broadcast failed:", err);
            toast.error("A critical error occurred while broadcasting.");
        } finally {
            setIsSendingEmail(false);
            setEmailProgress({ total: 0, sent: 0, current: "" });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 fade-in">
            <h1 className="admin-heading">
                Marketing & Offers
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in fade-in-delay-1">
                {/* Create Coupon Form */}
                <div className="lg:col-span-1 admin-panel p-6">
                    <div className="flex items-center gap-2 mb-6 font-bold text-lg text-gray-900">
                        <Plus size={20} /> Create Promo Code
                    </div>

                    <form onSubmit={handleCreateCoupon} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-500">PROMO CODE</label>
                            <div className="relative">
                                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. DIWALI20"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                    className="w-full pl-9 pr-3 py-2 admin-input"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500">TYPE</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                                    className="w-full px-3 py-2 admin-input"
                                >
                                    <option value="percentage">% Percentage</option>
                                    <option value="fixed">₹ Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500">VALUE</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                    className="w-full px-3 py-2 admin-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-500">MINIMUM ORDER VALUE (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={minOrder}
                                onChange={(e) => setMinOrder(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border bg-gray-50 border-gray-200 outline-none text-sm text-gray-900"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="admin-btn admin-btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? "Generating..." : "Generate Code"}
                        </button>
                    </form>
                </div>

                {/* Active Coupons List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="admin-panel-title">Active Promos</h2>
                        <span className="badge badge-warning">
                            {coupons.length} total
                        </span>
                    </div>

                    {coupons.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 text-gray-400">
                            <Tag size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No promo codes generated yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {coupons.map((coupon) => (
                                <div key={coupon.id} className="admin-panel flex items-center justify-between hover:border-[var(--forest)] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {coupon.discount_type === "percentage" ? <Percent size={20} /> : <Banknote size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold tracking-widest text-lg text-gray-900">
                                                {coupon.code}
                                            </h3>
                                            <p className="text-xs font-medium text-gray-500">
                                                {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                                                <span className="mx-2">•</span>
                                                Min. cart: ₹{coupon.min_order_value}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${coupon.is_active
                                                ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                                                : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            {coupon.is_active ? "Active" : "Disabled"}
                                        </button>
                                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Newsletter Subscribers Section */}
                    <div className="mt-8 admin-panel">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="admin-panel-title">Newsletter Subscribers</h2>
                            <span className="badge badge-info">
                                {subscribers.length} total
                            </span>
                        </div>
                        {subscribers.length === 0 ? (
                            <p className="text-sm italic text-center py-6 text-gray-500">No subscribers yet.</p>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto divide-y pr-2 scrollbar-thin border-gray-100">
                                {subscribers.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between py-3 border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">{sub.email}</span>
                                            <span className="text-[10px] text-gray-500">Subscribed on: {new Date(sub.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteSubscriber(sub.id)} 
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Subscriber"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mass Email Broadcast Tool */}
                    <div className="mt-12 admin-panel relative overflow-hidden bg-gray-50 border border-gray-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--forest)] opacity-5 rounded-bl-[100px] pointer-events-none" />

                        <div className="flex items-center gap-3 mb-6 text-gray-900">
                            <div className="p-2 rounded-lg bg-[var(--forest-light)] text-[var(--forest)]">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h2 className="admin-panel-title">Broadcast Update Email</h2>
                                <p className="text-xs font-medium text-gray-500">Send a rich-text update to all registered customers instantly.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendBroadcast} className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500">EMAIL SUBJECT</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Diwali Offer: FLAT 20% OFF Pure Honey!"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    disabled={isSendingEmail}
                                    className="w-full px-4 py-2 admin-input"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500">MESSAGE BODY (MARKDOWN SUPPORTED)</label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Write your email content here. You can use Markdown formatting like **bold**, *italics*, and [links](url)."
                                    value={emailContent}
                                    onChange={(e) => setEmailContent(e.target.value)}
                                    disabled={isSendingEmail}
                                    className="w-full px-4 py-3 admin-input text-sm font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingEmail}
                                className="admin-btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2"
                            >
                                {isSendingEmail ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        SENDING ({emailProgress.sent} / {emailProgress.total})
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        BROADCAST TO ALL CUSTOMERS
                                    </>
                                )}
                            </button>

                            {isSendingEmail && emailProgress.current && (
                                <p className="text-center text-xs animate-pulse mt-2 font-medium text-[var(--forest)]">
                                    Pinging: {emailProgress.current}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
