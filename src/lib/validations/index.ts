import { z } from 'zod';

// ─── Product Schemas ───
export const ProductCreateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    price: z.number().nonnegative(),
    discount_price: z.number().nonnegative().optional().nullable(),
    stock: z.number().int().nonnegative().default(0),
    category: z.string().max(100).optional(),
    image: z.string().max(1000).optional(),
    images: z.array(z.string().max(1000)).optional(),
    weight: z.string().max(50).optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
    slug: z.string().max(200).optional(),
}).passthrough();

export const ProductUpdateSchema = z.object({
    id: z.string().uuid("Invalid product ID"),
    originalStock: z.number().int().nonnegative().optional(),
}).passthrough();

// ─── Admin Order Update Schema ───
export const AdminOrderUpdateSchema = z.object({
    id: z.string().uuid("Invalid order ID"),
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
    tracking_number: z.string().max(100).optional().nullable(),
    courier_name: z.string().max(100).optional().nullable(),
}).passthrough();

// ─── Coupon Schema ───
export const CouponSchema = z.object({
    code: z.string().min(1).max(50),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.number().positive(),
    min_order_value: z.number().nonnegative().optional().default(0),
    max_uses: z.number().int().positive().optional(),
    is_active: z.boolean().default(true),
    expires_at: z.string().optional().nullable(),
}).passthrough();

// ─── Blog Schema ───
export const BlogSchema = z.object({
    title: z.string().min(1).max(300),
    slug: z.string().min(1).max(300),
    content: z.string().min(1).max(50000),
    excerpt: z.string().max(500).optional(),
    cover_image: z.string().max(1000).optional(),
    is_published: z.boolean().default(false),
    category: z.string().max(100).optional(),
}).passthrough();

// ─── Email Schema ───
export const EmailSendSchema = z.object({
    to: z.string().email(),
    type: z.string().min(1).max(50),
    payload: z.record(z.string(), z.unknown()),
});

// ─── Broadcast Schema ───
export const BroadcastSchema = z.object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(5000),
    image_url: z.string().url().max(1000).optional(),
    target: z.enum(["all", "subscribed"]).default("all"),
});

// ─── Editor Schema ───
export const EditorSchema = z.object({
    section: z.string().min(1).max(100),
    content: z.record(z.string(), z.unknown()),
});

// ─── Settings Schema ───
export const SettingsSchema = z.object({
    key: z.string().min(1).max(100),
    value: z.unknown(),
});

// ─── Feedback Schema ───
export const FeedbackSchema = z.object({
    ticket_id: z.string().uuid().optional(),
    reply: z.string().min(1).max(5000).optional(),
    status: z.string().max(20).optional(),
}).passthrough();

// ─── Razorpay Schemas ───
export const RazorpayCreateOrderSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().max(5).default("INR"),
    receipt: z.string().max(100).optional(),
});

export const RazorpayVerifySchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    order_id: z.string().optional(),
});

// ─── Cart Sync Schema ───
export const CartSyncSchema = z.object({
    cart_data: z.array(z.any()).default([]),
});

// ─── Auth Schemas ───
export const AuthEmailSchema = z.object({
    email: z.string().email("Invalid email address").max(255),
});
