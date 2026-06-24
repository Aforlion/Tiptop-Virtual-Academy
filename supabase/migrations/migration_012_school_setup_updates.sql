-- Tiptop Virtual Academy — School Setup and Curriculum Realignment
-- To be executed manually in the Supabase SQL Editor.

-- 1. Alter public.profiles role constraint to allow 'head_of_school'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('parent', 'student', 'teacher', 'admin', 'head_of_school'));

-- 2. Add curriculum classification columns to public.courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS curriculum_type TEXT CHECK (curriculum_type IN ('eyfs', 'cambridge', 'custom'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS key_stage TEXT;

-- 3. Create public.schemes_of_work table to house termly/weekly schedules
CREATE TABLE IF NOT EXISTS public.schemes_of_work (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    term TEXT NOT NULL CHECK (term IN ('autumn', 'spring', 'summer', 'holiday')),
    week INT NOT NULL CHECK (week BETWEEN 1 AND 12),
    theme TEXT NOT NULL,
    learning_objectives JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, term, week)
);

-- Enable RLS for Schemes of Work
ALTER TABLE public.schemes_of_work ENABLE ROW LEVEL SECURITY;

-- Select policy: authenticated users can read schemes of work
DROP POLICY IF EXISTS "Authenticated users can read schemes of work" ON public.schemes_of_work;
CREATE POLICY "Authenticated users can read schemes of work"
    ON public.schemes_of_work FOR SELECT
    USING (auth.role() = 'authenticated');

-- Write policy: admin and head_of_school can manage schemes of work
DROP POLICY IF EXISTS "Admin and Head of School can manage schemes of work" ON public.schemes_of_work;
CREATE POLICY "Admin and Head of School can manage schemes of work"
    ON public.schemes_of_work FOR ALL
    USING (
      (auth.jwt() ->> 'role') IN ('admin', 'head_of_school') OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head_of_school'))
    )
    WITH CHECK (
      (auth.jwt() ->> 'role') IN ('admin', 'head_of_school') OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head_of_school'))
    );
