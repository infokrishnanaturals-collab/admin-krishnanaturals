-- ====================================================================
-- Step 11: Analytics & Admin Action Logs
-- Run this in the Supabase SQL Editor
-- ====================================================================

-- 1. Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path TEXT NOT NULL,
    locale TEXT DEFAULT 'en',
    referrer TEXT,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views (session_id);

-- 2. Admin Action Logs Table
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    admin_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_action_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_action_logs (action);

-- 3. Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for page_views

-- Anyone (including anonymous) can insert page views (frontend tracking)
CREATE POLICY "anon_insert_page_views" ON page_views
    FOR INSERT
    WITH CHECK (true);

-- Only admins can read page views
CREATE POLICY "admin_read_page_views" ON page_views
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()::text
            AND profiles.role = 'admin'
        )
    );

-- 5. RLS Policies for admin_action_logs

-- Only admins can insert action logs
CREATE POLICY "admin_insert_logs" ON admin_action_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()::text
            AND profiles.role = 'admin'
        )
    );

-- Only admins can read action logs
CREATE POLICY "admin_read_logs" ON admin_action_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()::text
            AND profiles.role = 'admin'
        )
    );

-- 6. Grant usage to anon and authenticated roles
GRANT INSERT ON page_views TO anon;
GRANT INSERT ON page_views TO authenticated;
GRANT SELECT ON page_views TO authenticated;

GRANT INSERT ON admin_action_logs TO authenticated;
GRANT SELECT ON admin_action_logs TO authenticated;
