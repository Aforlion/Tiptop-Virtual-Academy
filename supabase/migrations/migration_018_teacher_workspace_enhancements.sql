-- Migration 018: Teacher Workspace, Attendance Metadata & Homework Manager Schema

-- =========================================================================
-- STREAM 1: ATTENDANCE CONSOLE ENHANCEMENTS
-- =========================================================================

-- Add 4-state attendance_status and connection_status metadata to student_bookings
ALTER TABLE public.student_bookings
  ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'present' CHECK (attendance_status IN ('present', 'late', 'absent', 'excused')),
  ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'joined' CHECK (connection_status IN ('joined', 'never_joined', 'disconnected_early'));

-- =========================================================================
-- STREAM 2: GOOGLE MEET & LIVE SESSION LOGGING ENHANCEMENTS
-- =========================================================================

-- Add Google Meet URL, Google Calendar sync status, retry queues & timestamp tracking
ALTER TABLE public.live_sessions
  ADD COLUMN IF NOT EXISTS google_meet_url TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending_retry', 'failed')),
  ADD COLUMN IF NOT EXISTS sync_error TEXT,
  ADD COLUMN IF NOT EXISTS actual_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_ended_at TIMESTAMPTZ;

-- Table for Google Workspace sync retries and audit logging
CREATE TABLE IF NOT EXISTS public.google_sync_retry_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('create_meet', 'sync_roster', 'publish_assignment')),
    payload JSONB,
    retry_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'failed')),
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.google_sync_retry_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and teachers can view sync retries" ON public.google_sync_retry_queue
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

-- =========================================================================
-- STREAM 3: HOMEWORK & ASSIGNMENT MANAGER
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.live_sessions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resource_url TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    published_to_classroom BOOLEAN NOT NULL DEFAULT false,
    google_classroom_assignment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Homework Submissions table (for parent/student portal integration)
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    submission_url TEXT,
    notes TEXT,
    graded BOOLEAN NOT NULL DEFAULT false,
    grade_feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments RLS
CREATE POLICY "Anyone authenticated can view assignments" ON public.assignments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers and Admins can CRUD assignments" ON public.assignments
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

-- Submissions RLS
CREATE POLICY "Students and parents can view own submissions" ON public.assignment_submissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.students WHERE id = assignment_submissions.student_id AND parent_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

CREATE POLICY "Parents can insert submissions for their children" ON public.assignment_submissions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.students WHERE id = assignment_submissions.student_id AND parent_id = auth.uid())
    );

CREATE POLICY "Teachers can grade submissions" ON public.assignment_submissions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );
