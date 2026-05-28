-- Tiptop Virtual Academy — Database Foundation Migration
-- To be executed manually in the Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE TABLES (Idempotent)

-- Profiles table (re-create/modify)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'student', 'teacher', 'admin')),
    phone_number TEXT,
    avatar_url TEXT,
    flexible_credits INT DEFAULT 0 CHECK (flexible_credits >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Sessions table
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    teacher_name TEXT NOT NULL,
    meeting_token TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    session_type TEXT CHECK (session_type IN ('cohort', 'flexible')) NOT NULL,
    max_seats INT DEFAULT 15,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort Enrollments table (Rule 2: Cohort Isolation)
CREATE TABLE IF NOT EXISTS public.cohort_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Student Bookings table
CREATE TABLE IF NOT EXISTS public.student_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, session_id)
);

-- 2. ENABLE ROW LEVEL SECURITY

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bookings ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (to allow re-running migration cleanly)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. CREATE RLS POLICIES

-- profiles
CREATE POLICY select_profiles ON public.profiles 
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY update_profiles ON public.profiles 
    FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY insert_profiles ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- students
CREATE POLICY select_students ON public.students 
    FOR SELECT USING (parent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY insert_students ON public.students 
    FOR INSERT WITH CHECK (parent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY update_students ON public.students 
    FOR UPDATE USING (parent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY delete_students ON public.students 
    FOR DELETE USING (parent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- courses
CREATE POLICY select_courses ON public.courses 
    FOR SELECT USING (true);

CREATE POLICY write_courses ON public.courses 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- live_sessions
CREATE POLICY select_sessions ON public.live_sessions 
    FOR SELECT USING (true);

CREATE POLICY write_sessions ON public.live_sessions 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- cohort_enrollments
CREATE POLICY select_cohort_enrollments ON public.cohort_enrollments 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY write_cohort_enrollments ON public.cohort_enrollments 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- student_bookings
CREATE POLICY select_student_bookings ON public.student_bookings 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY insert_student_bookings ON public.student_bookings 
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY delete_student_bookings ON public.student_bookings 
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 5. CREATE ATOMIC CREDIT GUARD FUNCTIONS

-- Book a flexible live session (Rule 1: Credit Guard)
CREATE OR REPLACE FUNCTION public.book_flexible_session(
    p_student_id UUID,
    p_session_id UUID,
    p_parent_id UUID
) RETURNS void AS $$
DECLARE
    v_credits INT;
    v_parent_of_student UUID;
    v_session_type TEXT;
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

    -- Deduct 1 credit
    UPDATE public.profiles SET flexible_credits = flexible_credits - 1 WHERE id = p_parent_id;

    -- Insert booking (fails if unique constraint violated)
    INSERT INTO public.student_bookings (student_id, session_id) VALUES (p_student_id, p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel a booking and refund credit if flexible
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
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. CREATE AUTOMATIC PROFILE TRIGGER ON SIGNUP

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_role TEXT;
    v_email_username TEXT;
BEGIN
    -- Extract role from metadata, default to 'parent'
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'parent');
    
    -- Extract names from metadata
    v_first_name := new.raw_user_meta_data->>'first_name';
    v_last_name := new.raw_user_meta_data->>'last_name';
    
    -- Parse full_name or name if specific name components are missing
    IF v_first_name IS NULL OR v_last_name IS NULL THEN
        DECLARE
            v_full_name TEXT;
            v_pos INT;
        BEGIN
            v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name');
            IF v_full_name IS NOT NULL THEN
                v_pos := position(' ' in trim(v_full_name));
                IF v_pos > 0 THEN
                    IF v_first_name IS NULL THEN
                        v_first_name := substring(trim(v_full_name) from 1 for v_pos - 1);
                    END IF;
                    IF v_last_name IS NULL THEN
                        v_last_name := substring(trim(v_full_name) from v_pos + 1);
                    END IF;
                ELSE
                    IF v_first_name IS NULL THEN
                        v_first_name := trim(v_full_name);
                    END IF;
                    IF v_last_name IS NULL THEN
                        v_last_name := 'User';
                    END IF;
                END IF;
            END IF;
        END;
    END IF;

    -- Final fallbacks
    v_first_name := COALESCE(v_first_name, new.raw_user_meta_data->>'given_name', split_part(new.email, '@', 1), 'Guest');
    v_last_name := COALESCE(v_last_name, new.raw_user_meta_data->>'family_name', 'User');

    -- Clean names
    v_first_name := COALESCE(NULLIF(trim(v_first_name), ''), 'Guest');
    v_last_name := COALESCE(NULLIF(trim(v_last_name), ''), 'User');

    -- Insert new profile (parents get 10 free starting credits)
    INSERT INTO public.profiles (id, first_name, last_name, role, flexible_credits, phone_number, avatar_url)
    VALUES (
        new.id,
        v_first_name,
        v_last_name,
        v_role,
        CASE WHEN v_role = 'parent' THEN 10 ELSE 0 END,
        new.raw_user_meta_data->>'phone_number',
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
