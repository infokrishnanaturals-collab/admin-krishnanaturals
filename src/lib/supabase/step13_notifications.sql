-- Phase 2: Push Notification System Data Structures
-- Run this in your Supabase SQL Editor

-- 1. FCM Tokens Table (Maps users/guests to device push tokens)
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- Nullable for guests
    token TEXT UNIQUE NOT NULL,
    device_type TEXT CHECK (device_type IN ('android', 'ios', 'web', 'unknown')) DEFAULT 'web',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast token lookups during broadcasts
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON public.fcm_tokens(token);

-- 2. Notifications Table (In-app inbox and historical log)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- Null if broadcast
    type TEXT CHECK (type IN ('order_update', 'promotion', 'system')) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 3. Push Campaigns Table (For Admin Analytics on Broadcasts)
CREATE TABLE IF NOT EXISTS public.push_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target_audience TEXT DEFAULT 'all',
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_campaigns ENABLE ROW LEVEL SECURITY;

-- FCM Tokens: Anyone can insert their own token (even guests), but only they can read it (or admin)
DROP POLICY IF EXISTS "Anyone can insert token" ON public.fcm_tokens;
CREATE POLICY "Anyone can insert token" ON public.fcm_tokens FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own token" ON public.fcm_tokens;
CREATE POLICY "Users can read own token" ON public.fcm_tokens FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

-- Notifications: Users can read their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid()::text = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid()::text = user_id);

-- Note: Admins bypass RLS using the SERVICE_ROLE_KEY
