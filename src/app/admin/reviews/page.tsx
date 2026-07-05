"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Star, CheckCircle, Trash2 } from "lucide-react";

type Review = {
    id: string;
    product_id: string;
    rating: number;
    comment: string;
    reviewer_name: string;
    is_verified_buyer: boolean;
    created_at: string;
    products?: { name: string };
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/reviews");
            if (!res.ok) throw new Error("Failed to load reviews");
            const data = await res.json();
            setReviews(data as Review[]);
        } catch (e) {
            toast.error("Failed to load reviews");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/admin/reviews?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            
            toast.success("Review deleted successfully");
            setReviews(reviews.filter(r => r.id !== id));
        } catch (e) {
            toast.error("Failed to delete review");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading reviews...</div>;

    return (
        <div className="max-w-6xl mx-auto fade-in">
            <h1 className="admin-heading mb-8">
                Product Reviews
            </h1>

            <div className="admin-table-container fade-in">
                <table className="admin-table w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Product</th>
                            <th className="p-4 font-semibold">Reviewer</th>
                            <th className="p-4 font-semibold">Rating</th>
                            <th className="p-4 font-semibold w-1/3">Comment</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => (
                            <tr key={review.id}>
                                <td className="p-4 text-sm whitespace-nowrap text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-medium text-gray-900">
                                    {review.products?.name || "Unknown Product"}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium flex items-center gap-2 text-gray-900">
                                        {review.reviewer_name}
                                        {review.is_verified_buyer && (
                                            <span title="Verified Buyer" className="flex items-center">
                                                <CheckCircle size={14} className="text-green-600" />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={14} fill={s <= review.rating ? "var(--gold)" : "none"} stroke={s <= review.rating ? "var(--gold)" : "#d1d5db"} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-sm line-clamp-2 text-gray-500" title={review.comment}>
                                    {review.comment}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {reviews.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No reviews yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
