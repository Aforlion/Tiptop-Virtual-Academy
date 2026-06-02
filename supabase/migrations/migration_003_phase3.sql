-- Tiptop Virtual Academy — Phase 3 Database Migration
-- To be executed manually in the Supabase SQL Editor.

-- 1. ALTER LIVE SESSIONS TO ASSIGN TEACHERS
ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. CREATE LESSON PLANS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Holds lesson details/notes/outline
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Lesson Plans
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- Lesson Plans Policies
-- Teachers can view and edit their own lesson plans
CREATE POLICY "Teachers can manage own lesson plans"
    ON public.lesson_plans FOR ALL
    USING (teacher_id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin')
    WITH CHECK (teacher_id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin');

-- Anyone authenticated can view lesson plans (for display inside the class or course lookup)
CREATE POLICY "Authenticated users can select lesson plans"
    ON public.lesson_plans FOR SELECT
    USING (auth.role() = 'authenticated');

-- 3. ALTER CREDIT PACKAGES FOR PAYSTACK SUBSCRIPTIONS
ALTER TABLE public.credit_packages 
ADD COLUMN IF NOT EXISTS billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS paystack_plan_code TEXT;

-- 4. ALTER PAYMENTS FOR SUBSCRIPTIONS TRACKING
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS subscription_code TEXT;
