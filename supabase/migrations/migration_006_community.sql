-- Tiptop Virtual Academy — Community & Administration Migration
-- Run this in the Supabase SQL Editor after migration_005_gamification.sql

-- ============================================================
-- 1. CLASSROOM CHAT MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('teacher', 'parent', 'admin', 'student')),
    body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view chat in sessions they're connected to
CREATE POLICY "Authenticated users can view chat messages"
    ON public.chat_messages FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users can post messages
CREATE POLICY "Authenticated users can post chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id AND auth.role() = 'authenticated');

-- Enable Realtime for the chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;


-- ============================================================
-- 2. DISCUSSION FORUMS
-- ============================================================

-- Named channels: global Tribes, per-course Q&A boards, announcements
CREATE TABLE IF NOT EXISTS public.forum_channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- NULL = global
    name            TEXT NOT NULL,
    description     TEXT,
    channel_type    TEXT NOT NULL DEFAULT 'tribe' CHECK (channel_type IN ('course_qa', 'tribe', 'announcements')),
    emoji           TEXT DEFAULT '💬',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name)
);

ALTER TABLE public.forum_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum channels"
    ON public.forum_channels FOR SELECT USING (true);

CREATE POLICY "Admins can manage forum channels"
    ON public.forum_channels FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');


-- Top-level forum posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id  UUID NOT NULL REFERENCES public.forum_channels(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
    body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
    pinned      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view forum posts"
    ON public.forum_posts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create posts"
    ON public.forum_posts FOR INSERT
    WITH CHECK (auth.uid() = author_id AND auth.role() = 'authenticated');

CREATE POLICY "Authors and admins can delete posts"
    ON public.forum_posts FOR DELETE
    USING (auth.uid() = author_id OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can pin posts"
    ON public.forum_posts FOR UPDATE
    USING ((auth.jwt() ->> 'role') = 'admin');


-- Threaded replies to posts
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
    is_answer   BOOLEAN NOT NULL DEFAULT FALSE, -- teacher/admin can mark as "verified answer"
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view replies"
    ON public.forum_replies FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create replies"
    ON public.forum_replies FOR INSERT
    WITH CHECK (auth.uid() = author_id AND auth.role() = 'authenticated');

CREATE POLICY "Authors and admins can delete replies"
    ON public.forum_replies FOR DELETE
    USING (auth.uid() = author_id OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Teachers/admins can mark answers"
    ON public.forum_replies FOR UPDATE
    USING (
        (auth.jwt() ->> 'role') IN ('admin', 'teacher')
        OR auth.uid() = author_id
    );


-- ============================================================
-- 3. CERTIFICATE TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title_text      TEXT NOT NULL DEFAULT 'Certificate of Completion',
    body_text       TEXT NOT NULL DEFAULT 'This certifies that {student_name} has successfully completed {course_title}.',
    signatory_name  TEXT NOT NULL DEFAULT 'Barbara Johnson',
    signatory_title TEXT NOT NULL DEFAULT 'Academy Director',
    accent_color    TEXT NOT NULL DEFAULT '#7c3aed',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id) -- one template per course
);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view templates (needed for student cert rendering)
CREATE POLICY "Authenticated users can view certificate templates"
    ON public.certificate_templates FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only admins can manage templates
CREATE POLICY "Admins can manage certificate templates"
    ON public.certificate_templates FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');


-- ============================================================
-- 4. SEED INITIAL FORUM CHANNELS
-- ============================================================

INSERT INTO public.forum_channels (name, description, channel_type, emoji)
VALUES
    ('General Announcements', 'Academy-wide updates and important news from staff.', 'announcements', '📢'),
    ('The Coding Tribe', 'A tribe for young coders to share projects, bugs, and wins!', 'tribe', '💻'),
    ('Science Explorers', 'Discuss planets, animals, and everything science!', 'tribe', '🔬'),
    ('Math Masters', 'Number puzzles, brain teasers, and maths help.', 'tribe', '🔢'),
    ('Reading Circle', 'Book recommendations, reading logs, and story sharing.', 'tribe', '📚')
ON CONFLICT (name) DO NOTHING;
