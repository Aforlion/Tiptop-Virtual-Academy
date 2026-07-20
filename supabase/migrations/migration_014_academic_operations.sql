-- Migration 014: Academic Operations Tables

CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, session_id)
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone authenticated can select assignments"
    ON public.assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins/Teachers can CRUD assignments"
    ON public.assignments FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

CREATE POLICY "Students/Parents can select/insert own submissions"
    ON public.student_submissions FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_id AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Admins/Teachers can select/update submissions"
    ON public.student_submissions FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

CREATE POLICY "Parents can view child attendance"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = student_id AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Admins/Teachers can CRUD attendance"
    ON public.attendance_records FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );
