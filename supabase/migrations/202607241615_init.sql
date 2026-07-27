-- supabase/migrations/202607241615_init.sql

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Core Identity)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'PARENT', 'TEACHER', 'EXECUTIVE')),
    full_name TEXT NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    birth_date DATE,
    age_group TEXT CHECK (age_group IN ('junior', 'senior')),
    cohort_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Parents can view their children's profiles" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = parent_id);

CREATE POLICY "Teachers can view all student profiles" 
    ON public.profiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'TEACHER'
        )
    );

-- 2. COHORTS TABLE
CREATE TABLE public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to cohorts" 
    ON public.cohorts FOR SELECT 
    TO authenticated 
    USING (true);

-- 3. SESSIONS TABLE (Classes/Timetable)
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    meet_url TEXT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read sessions" 
    ON public.sessions FOR SELECT 
    TO authenticated 
    USING (true);

-- 4. ATTENDANCE TABLE
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own attendance" 
    ON public.attendance FOR SELECT 
    USING (auth.uid() = student_id);

CREATE POLICY "Parents can read their children's attendance" 
    ON public.attendance FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = public.attendance.student_id AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can log attendance" 
    ON public.attendance FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'TEACHER'
        )
    );

-- 5. INVOICES TABLE (Finance)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('PAID', 'UNPAID')) DEFAULT 'UNPAID',
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own invoices" 
    ON public.invoices FOR SELECT 
    USING (auth.uid() = parent_id);

CREATE POLICY "Parents can pay their own invoices" 
    ON public.invoices FOR UPDATE 
    USING (auth.uid() = parent_id);

-- 6. ASSIGNMENTS TABLE
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read to assignments" 
    ON public.assignments FOR SELECT 
    TO authenticated 
    USING (true);

-- 7. SUBMISSIONS TABLE
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    file_url TEXT NOT NULL,
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and manage their submissions" 
    ON public.submissions FOR ALL 
    USING (auth.uid() = student_id);

CREATE POLICY "Teachers can grade submissions" 
    ON public.submissions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'TEACHER'
        )
    );

-- 8. TRANSACTIONAL OUTBOX TABLE
CREATE TABLE public.outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

ALTER TABLE public.outbox ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write outbox events
CREATE POLICY "Service role only outbox access" 
    ON public.outbox FOR ALL 
    USING (false);

-- 9. INTEGRATION LOGS TABLE
CREATE TABLE public.integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    message TEXT NOT NULL,
    details JSONB
);

ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Executives can view integration logs" 
    ON public.integration_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'EXECUTIVE'
        )
    );
