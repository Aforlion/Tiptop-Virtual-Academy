-- Tiptop Virtual Academy — Phase 2: Teacher Portal Migration
-- Run this in the Supabase SQL Editor after migration_003_phase3.sql

-- ============================================================
-- 1. TEACHER AVAILABILITY BLOCKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_availability (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon ... 6=Sat
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    timezone    TEXT NOT NULL DEFAULT 'Africa/Lagos',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, day_of_week, start_time) -- prevent exact duplicate slots
);

ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Teachers manage their own slots; admins see all
CREATE POLICY "Teachers manage own availability"
    ON public.teacher_availability FOR ALL
    USING (teacher_id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin')
    WITH CHECK (teacher_id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can view all availability"
    ON public.teacher_availability FOR SELECT
    USING ((auth.jwt() ->> 'role') = 'admin');


-- ============================================================
-- 2. TEACHER EARNINGS LEDGER
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_earnings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id          UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    base_fee_cents      INT NOT NULL DEFAULT 0,   -- Flat fee per session (admin-defined)
    credit_share_cents  INT NOT NULL DEFAULT 0,   -- Teacher's share of credits consumed
    total_cents         INT GENERATED ALWAYS AS (base_fee_cents + credit_share_cents) STORED,
    paid_out            BOOLEAN NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, session_id) -- one ledger entry per teacher per session
);

ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;

-- Teachers view their own earnings; admins manage all
CREATE POLICY "Teachers view own earnings"
    ON public.teacher_earnings FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Admins manage all earnings"
    ON public.teacher_earnings FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');


-- ============================================================
-- 3. AUTO-CREATE EARNINGS ENTRY ON SESSION COMPLETION
-- ============================================================
-- When a live_session is updated to status='completed' AND it has a teacher_id,
-- automatically insert a provisional earnings row (base_fee = 5000 NGN = 500000 kobo flat default).
-- Admins adjust base_fee and mark paid_out manually via the admin finance panel.

CREATE OR REPLACE FUNCTION public.handle_session_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seat_count   INT;
    v_credit_share INT;
    v_base_fee     INT := 500000; -- Default: 5,000 NGN in kobo
    v_share_rate   NUMERIC := 0.30; -- Teacher earns 30% of each flexible credit consumed (@ 2500 NGN / credit)
    v_credit_price INT := 250000; -- 2,500 NGN per credit in kobo
BEGIN
    -- Only fire when transitioning TO completed and teacher is assigned
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.teacher_id IS NOT NULL THEN

        -- Count how many flexible bookings this session had (credits consumed)
        SELECT COUNT(*) INTO v_seat_count
        FROM public.student_bookings
        WHERE session_id = NEW.id;

        -- Credit share: only applies to flexible sessions
        IF NEW.session_type = 'flexible' THEN
            v_credit_share := FLOOR(v_seat_count * v_credit_price * v_share_rate);
        ELSE
            v_credit_share := 0;
        END IF;

        -- Insert earnings record (ignore conflict = already exists)
        INSERT INTO public.teacher_earnings (teacher_id, session_id, base_fee_cents, credit_share_cents)
        VALUES (NEW.teacher_id, NEW.id, v_base_fee, v_credit_share)
        ON CONFLICT (teacher_id, session_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- Attach trigger to live_sessions
DROP TRIGGER IF EXISTS on_session_completed ON public.live_sessions;
CREATE TRIGGER on_session_completed
    AFTER UPDATE ON public.live_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_session_completion();
