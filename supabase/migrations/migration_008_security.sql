-- Tiptop Virtual Academy — Security Hardening Migration (Phase 6)
-- Run this in the Supabase SQL Editor after migration_007_assessments.sql
-- Addresses: CVE-3 (JWT role claim standardisation), submission IDOR fix,
--            and XP transaction delete protection.

-- ============================================================
-- 1. STANDARDISE ADMIN RLS ON ASSESSMENTS TABLE
--    Replace auth.jwt()-based checks with profile-table lookups
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage assessments" ON public.assessments;

CREATE POLICY "Admins can manage assessments"
    ON public.assessments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));


-- ============================================================
-- 2. STANDARDISE ADMIN RLS ON ASSESSMENT_QUESTIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage questions" ON public.assessment_questions;

CREATE POLICY "Admins can manage questions"
    ON public.assessment_questions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));


-- ============================================================
-- 3. FIX ASSESSMENT SUBMISSION INSERT POLICY
--    Replace open "authenticated can submit" with ownership check.
--    A parent can only submit for their own child.
--    This is the server-side RLS that backs up the action-layer guard.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can submit responses" ON public.assessment_submissions;

-- Parents may submit for their own children
CREATE POLICY "Parents can submit for own children"
    ON public.assessment_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE students.id = student_id
              AND students.parent_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );


-- ============================================================
-- 4. STANDARDISE ADMIN RLS ON CERTIFICATE TEMPLATES
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage certificate templates" ON public.certificate_templates;

CREATE POLICY "Admins can manage certificate templates"
    ON public.certificate_templates FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));


-- ============================================================
-- 5. STANDARDISE ADMIN RLS ON FORUM CHANNELS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage forum channels" ON public.forum_channels;

CREATE POLICY "Admins can manage forum channels"
    ON public.forum_channels FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));


-- ============================================================
-- 6. STANDARDISE ADMIN RLS ON FORUM POSTS
-- ============================================================

DROP POLICY IF EXISTS "Authors and admins can delete posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can pin posts" ON public.forum_posts;

CREATE POLICY "Authors and admins can delete posts"
    ON public.forum_posts FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can pin posts"
    ON public.forum_posts FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));


-- ============================================================
-- 7. STANDARDISE ADMIN/TEACHER RLS ON FORUM REPLIES
-- ============================================================

DROP POLICY IF EXISTS "Authors and admins can delete replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Teachers/admins can mark answers" ON public.forum_replies;

CREATE POLICY "Authors and admins can delete replies"
    ON public.forum_replies FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Teachers and admins can mark answers"
    ON public.forum_replies FOR UPDATE
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );


-- ============================================================
-- 8. PROTECT XP TRANSACTIONS — ADMIN-ONLY DELETE
--    Prevents students from manipulating their own XP log
-- ============================================================

-- Add explicit DELETE protection (no policy = no delete by default,
-- but making it explicit ensures future policy drops don't open it up)
CREATE POLICY "Only admins can delete XP transactions"
    ON public.student_xp_transactions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));
