-- Migration 010: Scheduling conflict triggers and age check constraints

-- 1. Adjust check constraints on courses to support age ranges up to 16
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS check_courses_age_range;
ALTER TABLE public.courses ADD CONSTRAINT check_courses_age_range CHECK (min_age >= 3 AND max_age <= 16 AND min_age <= max_age);

-- 2. Prevent teacher availability overlaps
CREATE OR REPLACE FUNCTION public.check_teacher_availability_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.teacher_availability
        WHERE teacher_id = NEW.teacher_id
          AND day_of_week = NEW.day_of_week
          AND id != NEW.id
          AND NEW.start_time < end_time
          AND NEW.end_time > start_time
    ) THEN
        RAISE EXCEPTION 'Teacher availability block conflicts with an existing slot (overlapping hours).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_teacher_availability_overlap ON public.teacher_availability;
CREATE TRIGGER prevent_teacher_availability_overlap
    BEFORE INSERT OR UPDATE ON public.teacher_availability
    FOR EACH ROW EXECUTE FUNCTION public.check_teacher_availability_overlap();

-- 3. Prevent teacher live sessions scheduling overlaps
CREATE OR REPLACE FUNCTION public.check_live_session_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if a teacher is assigned and the session is active (not cancelled)
    IF NEW.teacher_id IS NOT NULL AND NEW.status != 'cancelled' THEN
        IF EXISTS (
            SELECT 1 FROM public.live_sessions
            WHERE teacher_id = NEW.teacher_id
              AND id != NEW.id
              AND status != 'cancelled'
              AND NEW.scheduled_start < scheduled_end
              AND NEW.scheduled_end > scheduled_start
        ) THEN
            RAISE EXCEPTION 'Teacher is already scheduled for another live session during this time period.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_live_session_overlap ON public.live_sessions;
CREATE TRIGGER prevent_live_session_overlap
    BEFORE INSERT OR UPDATE ON public.live_sessions
    FOR EACH ROW EXECUTE FUNCTION public.check_live_session_overlap();
