-- ============================================================
-- KRISHNA NATURALS — PHASE 9: PERSISTENT SUPPORT CHAT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open' or 'closed'
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: We will associate each room with one user. If they open a chat, we check if they have an 'open' room.
-- If so, we load it. If not, we create one.

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.support_rooms(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'user' or 'admin'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Rooms
DROP POLICY IF EXISTS "Users can view own support rooms" ON public.support_rooms;
CREATE POLICY "Users can view own support rooms" ON public.support_rooms FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Admins can view all support rooms" ON public.support_rooms;
CREATE POLICY "Admins can view all support rooms" ON public.support_rooms FOR SELECT USING (auth.email() IN ('info.krishnanaturals@gmail.com', 'veer.b.builds@gmail.com'));

DROP POLICY IF EXISTS "Users can insert own support rooms" ON public.support_rooms;
CREATE POLICY "Users can insert own support rooms" ON public.support_rooms FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Admins can update support rooms" ON public.support_rooms;
CREATE POLICY "Admins can update support rooms" ON public.support_rooms FOR UPDATE USING (auth.email() IN ('info.krishnanaturals@gmail.com', 'veer.b.builds@gmail.com'));

DROP POLICY IF EXISTS "Users can update own support rooms" ON public.support_rooms;
CREATE POLICY "Users can update own support rooms" ON public.support_rooms FOR UPDATE USING (auth.uid()::text = user_id);

-- Policies for Messages
DROP POLICY IF EXISTS "Users can view own room messages" ON public.support_messages;
CREATE POLICY "Users can view own room messages" ON public.support_messages FOR SELECT USING (
    room_id IN (SELECT id FROM public.support_rooms WHERE user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Admins can view all messages" ON public.support_messages;
CREATE POLICY "Admins can view all messages" ON public.support_messages FOR SELECT USING (auth.email() IN ('info.krishnanaturals@gmail.com', 'veer.b.builds@gmail.com'));

DROP POLICY IF EXISTS "Users can insert messages to own room" ON public.support_messages;
CREATE POLICY "Users can insert messages to own room" ON public.support_messages FOR INSERT WITH CHECK (
    room_id IN (SELECT id FROM public.support_rooms WHERE user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Admins can insert messages" ON public.support_messages;
CREATE POLICY "Admins can insert messages" ON public.support_messages FOR INSERT WITH CHECK (auth.email() IN ('info.krishnanaturals@gmail.com', 'veer.b.builds@gmail.com'));

DROP POLICY IF EXISTS "Users can update own messages (read status)" ON public.support_messages;
CREATE POLICY "Users can update own messages (read status)" ON public.support_messages FOR UPDATE USING (
    room_id IN (SELECT id FROM public.support_rooms WHERE user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Admins can update messages" ON public.support_messages;
CREATE POLICY "Admins can update messages" ON public.support_messages FOR UPDATE USING (auth.email() IN ('info.krishnanaturals@gmail.com', 'veer.b.builds@gmail.com'));

