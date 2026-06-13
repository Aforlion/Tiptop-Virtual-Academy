-- Migration 009: Credit Ledger table and atomic logging triggers/functions

-- 1. Create credit_ledger table
CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- Positive for credits added, negative for credits deducted
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'booking_fee', 'refund', 'admin_adjustment')),
    reference_id UUID, -- References booking_id or payment_id if applicable
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY select_ledger_logs ON public.credit_ledger
    FOR SELECT USING (auth.uid() = parent_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY insert_ledger_logs ON public.credit_ledger
    FOR INSERT WITH CHECK (auth.uid() = parent_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Rewrite book_flexible_session to log in credit_ledger
CREATE OR REPLACE FUNCTION public.book_flexible_session(
    p_student_id UUID,
    p_session_id UUID,
    p_parent_id UUID
) RETURNS void AS $$
DECLARE
    v_credits INT;
    v_parent_of_student UUID;
    v_session_type TEXT;
    v_booking_id UUID;
BEGIN
    -- Verify parent owns the student
    SELECT parent_id INTO v_parent_of_student FROM public.students WHERE id = p_student_id;
    IF v_parent_of_student IS NULL OR v_parent_of_student != p_parent_id THEN
        RAISE EXCEPTION 'Student does not belong to this parent.';
    END IF;

    -- Verify that the session is flexible
    SELECT session_type INTO v_session_type FROM public.live_sessions WHERE id = p_session_id;
    IF v_session_type IS NULL OR v_session_type != 'flexible' THEN
        RAISE EXCEPTION 'Session is not a flexible booking session.';
    END IF;

    -- Check and lock parent's credit balance
    SELECT flexible_credits INTO v_credits FROM public.profiles WHERE id = p_parent_id FOR UPDATE;
    IF v_credits IS NULL OR v_credits < 1 THEN
        RAISE EXCEPTION 'Insufficient flexible credits.';
    END IF;

    -- Deduct 1 credit from profiles
    UPDATE public.profiles SET flexible_credits = flexible_credits - 1 WHERE id = p_parent_id;

    -- Insert booking
    v_booking_id := gen_random_uuid();
    INSERT INTO public.student_bookings (id, student_id, session_id) 
    VALUES (v_booking_id, p_student_id, p_session_id);

    -- Log transaction in credit_ledger
    INSERT INTO public.credit_ledger (parent_id, amount, transaction_type, reference_id)
    VALUES (p_parent_id, -1, 'booking_fee', v_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Rewrite cancel_flexible_booking to log in credit_ledger
CREATE OR REPLACE FUNCTION public.cancel_flexible_booking(
    p_booking_id UUID,
    p_parent_id UUID
) RETURNS void AS $$
DECLARE
    v_student_id UUID;
    v_session_id UUID;
    v_parent_of_student UUID;
    v_session_type TEXT;
BEGIN
    -- Fetch booking details
    SELECT student_id, session_id INTO v_student_id, v_session_id FROM public.student_bookings WHERE id = p_booking_id;
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Booking not found.';
    END IF;

    -- Verify parent owns student
    SELECT parent_id INTO v_parent_of_student FROM public.students WHERE id = v_student_id;
    IF v_parent_of_student IS NULL OR v_parent_of_student != p_parent_id THEN
        RAISE EXCEPTION 'Unauthorized to cancel this booking.';
    END IF;

    -- Verify session type
    SELECT session_type INTO v_session_type FROM public.live_sessions WHERE id = v_session_id;

    -- Delete the booking
    DELETE FROM public.student_bookings WHERE id = p_booking_id;

    -- Refund credit if it was a flexible booking
    IF v_session_type = 'flexible' THEN
        UPDATE public.profiles SET flexible_credits = flexible_credits + 1 WHERE id = p_parent_id;
        
        -- Log refund in credit_ledger
        INSERT INTO public.credit_ledger (parent_id, amount, transaction_type, reference_id)
        VALUES (p_parent_id, 1, 'refund', p_booking_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
