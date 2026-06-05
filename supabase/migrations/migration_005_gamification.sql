-- Tiptop Virtual Academy — Phase 2: Student Engagement & Gamification Migration
-- Run this in the Supabase SQL Editor after migration_004_teacher_portal.sql

-- ============================================================
-- 1. XP (EXPERIENCE POINTS) INTEGRATION
-- ============================================================

-- Add cumulative XP to students
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0 CHECK (xp >= 0);

-- Table: historical XP ledger transactions
CREATE TABLE IF NOT EXISTS public.student_xp_transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    amount        INT NOT NULL CHECK (amount != 0),
    reason        TEXT NOT NULL, -- 'attendance', 'badge_earned', 'challenge_completed', 'streak_bonus'
    reference_id  UUID, -- session_id, challenge_id, etc.
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on XP transactions
ALTER TABLE public.student_xp_transactions ENABLE ROW LEVEL SECURITY;

-- Parents/students can view their own XP logs
CREATE POLICY "Users view own student XP logs"
    ON public.student_xp_transactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.students 
        WHERE students.id = student_id 
          AND (students.parent_id = auth.uid() OR students.id = auth.uid())
    ) OR (auth.jwt() ->> 'role') = 'admin');

-- Trigger to keep students.xp updated when a transaction is added
CREATE OR REPLACE FUNCTION public.sync_student_cumulative_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.students
    SET xp = COALESCE(xp, 0) + NEW.amount
    WHERE id = NEW.student_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_xp_transaction_added ON public.student_xp_transactions;
CREATE TRIGGER on_xp_transaction_added
    AFTER INSERT ON public.student_xp_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_student_cumulative_xp();


-- ============================================================
-- 2. CHALLENGES & QUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.challenges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    xp_reward     INT NOT NULL CHECK (xp_reward > 0),
    target_count  INT NOT NULL CHECK (target_count > 0),
    key_code      TEXT UNIQUE NOT NULL, -- e.g. 'attend_classes', 'earn_wizard_badge'
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
    ON public.challenges FOR SELECT
    USING (true);

-- Student Challenges Tracking
CREATE TABLE IF NOT EXISTS public.student_challenges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id    UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    progress_count  INT NOT NULL DEFAULT 0,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, challenge_id)
);

ALTER TABLE public.student_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own student challenges"
    ON public.student_challenges FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.students 
        WHERE students.id = student_id 
          AND (students.parent_id = auth.uid() OR students.id = auth.uid())
    ) OR (auth.jwt() ->> 'role') = 'admin');

-- Seed Challenges
INSERT INTO public.challenges (title, description, xp_reward, target_count, key_code)
VALUES
    ('Class Explorer', 'Attend 3 live learning sessions', 300, 3, 'attend_classes'),
    ('Logic Wizard', 'Earn the Logic Wizard badge (🧠) for writing bug-free loops', 150, 1, 'earn_wizard_badge'),
    ('Science Explorer', 'Earn the Space Explorer badge (🚀) for stellar calculations', 150, 1, 'earn_explorer_badge'),
    ('Dino Hunter', 'Earn the Dino Discovery badge (🦖) for digging up history secrets', 150, 1, 'earn_dino_badge')
ON CONFLICT (key_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward,
    target_count = EXCLUDED.target_count;


-- ============================================================
-- 3. GAMIFICATION BUSINESS LOGIC & TRIGGERS
-- ============================================================

-- Function: Auto-complete challenges and reward XP
CREATE OR REPLACE FUNCTION public.handle_challenge_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_xp_reward INT;
BEGIN
    -- Check if progress reaches target
    IF NEW.progress_count >= (SELECT target_count FROM public.challenges WHERE id = NEW.challenge_id) 
       AND OLD.completed = FALSE AND NEW.completed = FALSE THEN
        
        NEW.completed := TRUE;
        NEW.completed_at := NOW();

        SELECT xp_reward INTO v_xp_reward FROM public.challenges WHERE id = NEW.challenge_id;

        -- Record XP transaction
        INSERT INTO public.student_xp_transactions (student_id, amount, reason, reference_id)
        VALUES (NEW.student_id, v_xp_reward, 'challenge_completed', NEW.challenge_id);
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_challenge_progress ON public.student_challenges;
CREATE TRIGGER on_challenge_progress
    BEFORE UPDATE ON public.student_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_challenge_completion();


-- Function: Listens to student bookings (attendance & badges) to update XP & challenges
CREATE OR REPLACE FUNCTION public.process_student_bookings_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_badges TEXT[];
    v_badge TEXT;
    v_class_challenge_id UUID;
    v_wizard_challenge_id UUID;
    v_explorer_challenge_id UUID;
    v_dino_challenge_id UUID;
BEGIN
    -- Resolve challenge IDs
    SELECT id INTO v_class_challenge_id FROM public.challenges WHERE key_code = 'attend_classes';
    SELECT id INTO v_wizard_challenge_id FROM public.challenges WHERE key_code = 'earn_wizard_badge';
    SELECT id INTO v_explorer_challenge_id FROM public.challenges WHERE key_code = 'earn_explorer_badge';
    SELECT id INTO v_dino_challenge_id FROM public.challenges WHERE key_code = 'earn_dino_badge';

    -- 1. ATTENDANCE EVENT: Attended transitions from false to true
    IF NEW.attended = TRUE AND (OLD.attended IS NULL OR OLD.attended = FALSE) THEN
        -- Reward 100 XP for attending class
        INSERT INTO public.student_xp_transactions (student_id, amount, reason, reference_id)
        VALUES (NEW.student_id, 100, 'attendance', NEW.session_id);

        -- Progress "Class Explorer" challenge
        IF v_class_challenge_id IS NOT NULL THEN
            INSERT INTO public.student_challenges (student_id, challenge_id, progress_count)
            VALUES (NEW.student_id, v_class_challenge_id, 1)
            ON CONFLICT (student_id, challenge_id) DO UPDATE SET
                progress_count = LEAST(student_challenges.progress_count + 1, 3);
        END IF;
    END IF;

    -- 2. BADGE EVENT: Newly awarded badges
    IF NEW.earned_badges IS NOT NULL AND NEW.earned_badges != '{}'::TEXT[] THEN
        -- Find which badges are new
        IF TG_OP = 'INSERT' THEN
            v_new_badges := NEW.earned_badges;
        ELSE
            SELECT ARRAY(
                SELECT unnest(NEW.earned_badges) 
                EXCEPT 
                SELECT unnest(COALESCE(OLD.earned_badges, '{}'::TEXT[]))
            ) INTO v_new_badges;
        END IF;

        -- Loop through new badges
        FOREACH v_badge IN ARRAY v_new_badges LOOP
            -- Reward 50 XP per badge
            INSERT INTO public.student_xp_transactions (student_id, amount, reason, reference_id)
            VALUES (NEW.student_id, 50, 'badge_earned', NEW.session_id);

            -- Challenge progress checking
            IF v_badge = 'logic_wizard' AND v_wizard_challenge_id IS NOT NULL THEN
                INSERT INTO public.student_challenges (student_id, challenge_id, progress_count)
                VALUES (NEW.student_id, v_wizard_challenge_id, 1)
                ON CONFLICT (student_id, challenge_id) DO UPDATE SET progress_count = 1;
            ELSIF v_badge = 'space_explorer' AND v_explorer_challenge_id IS NOT NULL THEN
                INSERT INTO public.student_challenges (student_id, challenge_id, progress_count)
                VALUES (NEW.student_id, v_explorer_challenge_id, 1)
                ON CONFLICT (student_id, challenge_id) DO UPDATE SET progress_count = 1;
            ELSIF v_badge = 'dino_discovery' AND v_dino_challenge_id IS NOT NULL THEN
                INSERT INTO public.student_challenges (student_id, challenge_id, progress_count)
                VALUES (NEW.student_id, v_dino_challenge_id, 1)
                ON CONFLICT (student_id, challenge_id) DO UPDATE SET progress_count = 1;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_gamified ON public.student_bookings;
CREATE TRIGGER on_booking_gamified
    AFTER INSERT OR UPDATE ON public.student_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.process_student_bookings_gamification();
