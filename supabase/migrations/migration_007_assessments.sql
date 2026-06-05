-- Tiptop Virtual Academy — Assessments & Quiz Engine Migration
-- Run this in the Supabase SQL Editor after migration_006_community.sql

-- ============================================================
-- 1. ASSESSMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    time_limit_mins INT NOT NULL DEFAULT 20 CHECK (time_limit_mins > 0),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view assessments"
    ON public.assessments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage assessments"
    ON public.assessments FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');


-- ============================================================
-- 2. ASSESSMENT QUESTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   TEXT NOT NULL CHECK (question_type IN ('mcq_single', 'mcq_multiple', 'fill_in', 'reading')),
    options         JSONB DEFAULT '[]'::jsonb, -- e.g. ["Option A", "Option B"...]
    correct_answer  JSONB NOT NULL,            -- e.g. "Option A" or ["Option A", "Option C"]
    difficulty      TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points          INT NOT NULL DEFAULT 10 CHECK (points >= 0),
    passage_text    TEXT,                      -- Only used for 'reading' type comprehension passages
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view questions"
    ON public.assessment_questions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage questions"
    ON public.assessment_questions FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');


-- ============================================================
-- 3. ASSESSMENT SUBMISSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    assessment_id   UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    score           INT NOT NULL CHECK (score >= 0),
    percentage      NUMERIC(5,2) NOT NULL CHECK (percentage BETWEEN 0 AND 100),
    correct_count   INT NOT NULL DEFAULT 0,
    incorrect_count INT NOT NULL DEFAULT 0,
    skipped_count   INT NOT NULL DEFAULT 0,
    time_spent_secs INT NOT NULL DEFAULT 0,
    responses       JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of response details
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Students and their parents can view their own submissions
CREATE POLICY "Users can view own/child submissions"
    ON public.assessment_submissions FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND (
            student_id IN (
                SELECT id FROM public.students WHERE parent_id = auth.uid()
            )
            OR student_id = auth.uid() -- fallback if direct student login matches profile.id
            OR (auth.jwt() ->> 'role') IN ('admin', 'teacher')
        )
    );

-- Authed users can submit responses
CREATE POLICY "Authenticated users can submit responses"
    ON public.assessment_submissions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- 4. SEED SAMPLE ASSESSMENT AND QUESTIONS
-- ============================================================

DO $$
DECLARE
    v_course_id UUID;
    v_assess_id UUID;
BEGIN
    -- Get any published course, otherwise insert a fallback
    SELECT id INTO v_course_id FROM public.courses LIMIT 1;
    IF v_course_id IS NULL THEN
        INSERT INTO public.courses (title, description, min_age, max_age, is_published)
        VALUES ('Creative Coding Foundations', 'Learn logic flows, loops, and building fun code blocks!', 7, 12, true)
        RETURNING id INTO v_course_id;
    END IF;

    -- Create seed assessment
    INSERT INTO public.assessments (course_id, title, description, time_limit_mins)
    VALUES (v_course_id, 'Logic & Loop Championship Quiz', 'Test your logic loop power! Tackle MCQs, fill-in puzzles, and a reading comprehension challenge.', 10)
    RETURNING id INTO v_assess_id;

    -- Question 1: MCQ Single
    INSERT INTO public.assessment_questions (assessment_id, question_text, question_type, options, correct_answer, difficulty, points)
    VALUES (
        v_assess_id,
        'Which loop structure is designed to repeat a block of code a set number of times?',
        'mcq_single',
        '["While Loop", "For Loop", "If statement", "Function"]'::jsonb,
        '"For Loop"'::jsonb,
        'easy',
        10
    );

    -- Question 2: MCQ Multiple
    INSERT INTO public.assessment_questions (assessment_id, question_text, question_type, options, correct_answer, difficulty, points)
    VALUES (
        v_assess_id,
        'Identify all keywords commonly used in loops to alter their standard path (Select all that apply):',
        'mcq_multiple',
        '["break", "continue", "stop", "pause"]'::jsonb,
        '["break", "continue"]'::jsonb,
        'medium',
        15
    );

    -- Question 3: Fill In
    INSERT INTO public.assessment_questions (assessment_id, question_text, question_type, correct_answer, difficulty, points)
    VALUES (
        v_assess_id,
        'Fill in the blank: An infinite loop runs forever because its conditional check always resolves to _____. (Answer with a single word)',
        'fill_in',
        '"true"'::jsonb,
        'medium',
        15
    );

    -- Question 4: Reading Comprehension
    INSERT INTO public.assessment_questions (assessment_id, question_text, question_type, options, correct_answer, difficulty, points, passage_text)
    VALUES (
        v_assess_id,
        'According to the passage, why was ADA-1 able to recover the lost space capsule?',
        'reading',
        '["Because it followed the recursive path back to orbit", "Because it used infinite loop fuel tanks", "Because its algorithm skipped all variables", "Because it turned off its main engine"]'::jsonb,
        '"Because it followed the recursive path back to orbit"'::jsonb,
        'hard',
        20,
        'Ada the space exploration bot was stuck in a deep asteroid field. Her main engines were low on fuel. Instead of firing continuous booster blocks, she calculated a recursive landing algorithm. By repeating small orbital maneuvers, ADA-1 was able to loop around gravity wells and safely retrieve the lost space capsule without burning additional fuel.'
    );

END $$;
