-- Migration 017: Guided Enrollment Platform & Curriculum Repository Engine Schema

-- =========================================================================
-- STREAM 1: ENR-001 ENROLLMENT & PRICING ENGINE
-- =========================================================================

-- Products catalog table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('full_time', 'subject', 'support', 'holiday', 'tutoring')),
    base_price_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    registration_fee_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    pricing_model TEXT NOT NULL CHECK (pricing_model IN ('termly', 'monthly', 'hourly', 'one_time')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed baseline products from research/pricing specs
INSERT INTO public.products (name, code, description, category, base_price_ngn, registration_fee_ngn, pricing_model)
VALUES 
    ('Full Time Early Years', 'FT-EY', 'Ages 3-5 complete Early Years Foundation Stage program', 'full_time', 600000.00, 50000.00, 'termly'),
    ('Full Time Primary', 'FT-PRI', 'Ages 6-11 British Primary curriculum cohort enrollment', 'full_time', 750000.00, 70000.00, 'termly'),
    ('Full Time Secondary', 'FT-SEC', 'Ages 11-16 British Secondary curriculum cohort enrollment', 'full_time', 900000.00, 70000.00, 'termly'),
    ('Individual Subject (KS 2/3)', 'IND-KS23', 'Single subject enrollment for Key Stage 2 or 3', 'subject', 70000.00, 0.00, 'termly'),
    ('After School Support (Group)', 'SUP-GRP', 'Group support classes after regular school hours', 'support', 50000.00, 0.00, 'termly'),
    ('Holiday Classes', 'HOL-CLS', 'Intensive holiday learning bootcamps and classes', 'holiday', 150000.00, 0.00, 'one_time'),
    ('Cambridge / IGCSE Prep', 'IGCSE-PREP', 'Per subject Cambridge Checkpoint and IGCSE preparation', 'subject', 100000.00, 0.00, 'termly'),
    ('One-to-One Tutoring', 'TUT-1ON1', 'Personalized private tutoring session package', 'tutoring', 70000.00, 0.00, 'monthly')
ON CONFLICT (code) DO UPDATE SET 
    base_price_ngn = EXCLUDED.base_price_ngn,
    registration_fee_ngn = EXCLUDED.registration_fee_ngn;

-- Guided Enrollment Sessions table
CREATE TABLE IF NOT EXISTS public.guided_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'documents_pending', 'payment_pending', 'completed', 'cancelled')),
    referral_code TEXT,
    sibling_count INT NOT NULL DEFAULT 0,
    subtotal_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    registration_fees_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enrollment Student Items (Enrolling children per order)
CREATE TABLE IF NOT EXISTS public.guided_enrollment_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.guided_enrollments(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    target_year_group TEXT,
    admission_doc_url TEXT,
    provisioned_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    google_classroom_assigned BOOLEAN NOT NULL DEFAULT false,
    google_classroom_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Notifications Log (Add missing columns if notifications table exists from migration 015)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure type and profile_id columns exist regardless of whether table existed prior
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';

-- Enable RLS for Stream 1
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_enrollment_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Parents can CRUD their own enrollments" ON public.guided_enrollments FOR ALL USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Admins can view all enrollments" ON public.guided_enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Parents can CRUD their enrollment students" ON public.guided_enrollment_students FOR ALL USING (EXISTS (SELECT 1 FROM public.guided_enrollments WHERE id = guided_enrollment_students.enrollment_id AND parent_id = auth.uid()));
CREATE POLICY "Admins can view all enrollment students" ON public.guided_enrollment_students FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can read their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications read status" ON public.notifications;
CREATE POLICY "Users can read their notifications" ON public.notifications FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can update their notifications read status" ON public.notifications FOR UPDATE USING (profile_id = auth.uid());


-- =========================================================================
-- STREAM 2: CURR-001 BRITISH CURRICULUM REPOSITORY ENGINE
-- =========================================================================

-- Curriculum Versions
CREATE TABLE IF NOT EXISTS public.curriculum_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_year INT NOT NULL DEFAULT 2026,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.curriculum_versions (version_code, title, description)
VALUES ('UK-NAT-2026', 'British National Curriculum 2026', 'Standard primary and secondary British curriculum framework')
ON CONFLICT (version_code) DO NOTHING;

-- Key Stages
CREATE TABLE IF NOT EXISTS public.key_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.key_stages (code, name, min_age, max_age)
VALUES 
    ('EYFS', 'Early Years Foundation Stage', 3, 5),
    ('KS1', 'Key Stage 1', 5, 7),
    ('KS2', 'Key Stage 2', 7, 11),
    ('KS3', 'Key Stage 3', 11, 14),
    ('KS4', 'Key Stage 4 (IGCSE)', 14, 16)
ON CONFLICT (code) DO NOTHING;

-- Year Groups
CREATE TABLE IF NOT EXISTS public.year_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_stage_id UUID NOT NULL REFERENCES public.key_stages(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sequence_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.year_groups (key_stage_id, code, name, sequence_order)
SELECT id, 'Nursery', 'Nursery / EYFS 1', 1 FROM public.key_stages WHERE code = 'EYFS'
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.year_groups (key_stage_id, code, name, sequence_order)
SELECT id, 'Reception', 'Reception / EYFS 2', 2 FROM public.key_stages WHERE code = 'EYFS'
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.year_groups (key_stage_id, code, name, sequence_order)
SELECT id, 'Year 1', 'Year 1 Primary', 3 FROM public.key_stages WHERE code = 'KS1'
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.year_groups (key_stage_id, code, name, sequence_order)
SELECT id, 'Year 2', 'Year 2 Primary', 4 FROM public.key_stages WHERE code = 'KS1'
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.year_groups (key_stage_id, code, name, sequence_order)
SELECT id, 'Year 3', 'Year 3 Primary', 5 FROM public.key_stages WHERE code = 'KS2'
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.year_groups (key_stage_id, code, name, sequence_order)
SELECT id, 'Year 4', 'Year 4 Primary', 6 FROM public.key_stages WHERE code = 'KS2'
ON CONFLICT (code) DO NOTHING;

-- Curriculum Subjects
CREATE TABLE IF NOT EXISTS public.curriculum_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'core' CHECK (category IN ('core', 'foundation', 'elective')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.curriculum_subjects (code, name, category)
VALUES 
    ('ENG', 'English Language & Literacy', 'core'),
    ('MATH', 'Mathematics & Numeracy', 'core'),
    ('SCI', 'Science & Scientific Enquiry', 'core'),
    ('COMP', 'Computing & Digital Skills', 'foundation'),
    ('ART', 'Art & Design', 'foundation'),
    ('HUM', 'Humanities (History & Geography)', 'foundation')
ON CONFLICT (code) DO NOTHING;

-- Subject Topics
CREATE TABLE IF NOT EXISTS public.subject_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id) ON DELETE CASCADE,
    year_group_id UUID NOT NULL REFERENCES public.year_groups(id) ON DELETE CASCADE,
    term_number INT NOT NULL CHECK (term_number BETWEEN 1 AND 3),
    title TEXT NOT NULL,
    description TEXT,
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Objectives Repository
CREATE TABLE IF NOT EXISTS public.learning_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.subject_topics(id) ON DELETE CASCADE,
    objective_code TEXT NOT NULL UNIQUE,
    statement TEXT NOT NULL,
    bloom_taxonomy_level TEXT DEFAULT 'Understanding',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for Stream 2
ALTER TABLE public.curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read curriculum structure" ON public.curriculum_versions FOR SELECT USING (true);
CREATE POLICY "Anyone can read key stages" ON public.key_stages FOR SELECT USING (true);
CREATE POLICY "Anyone can read year groups" ON public.year_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can read subjects" ON public.curriculum_subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can read topics" ON public.subject_topics FOR SELECT USING (true);
CREATE POLICY "Anyone can read learning objectives" ON public.learning_objectives FOR SELECT USING (true);

CREATE POLICY "Admins can manage curriculum" ON public.subject_topics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage learning objectives" ON public.learning_objectives FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- =========================================================================
-- AUTOMATIC STUDENT PROVISIONING STORED PROCEDURE & TRIGGER
-- =========================================================================

CREATE OR REPLACE FUNCTION public.provision_enrolled_students(p_enrollment_id UUID)
RETURNS VOID AS $$
DECLARE
    v_enrollment RECORD;
    v_student_item RECORD;
    v_new_student_id UUID;
    v_google_email TEXT;
BEGIN
    -- Fetch enrollment record
    SELECT * INTO v_enrollment FROM public.guided_enrollments WHERE id = p_enrollment_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Enrollment record % not found', p_enrollment_id;
    END IF;

    -- Loop over all students attached to enrollment
    FOR v_student_item IN 
        SELECT * FROM public.guided_enrollment_students WHERE enrollment_id = p_enrollment_id AND provisioned_student_id IS NULL
    LOOP
        -- Create student record under parent
        INSERT INTO public.students (parent_id, first_name, date_of_birth, notes)
        VALUES (
            v_enrollment.parent_id, 
            v_student_item.first_name, 
            v_student_item.date_of_birth, 
            'Auto-provisioned from Guided Enrollment (' || v_enrollment.id || ')'
        )
        RETURNING id INTO v_new_student_id;

        -- Generate Google Classroom email identifier
        v_google_email := lower(v_student_item.first_name) || '.' || lower(v_student_item.last_name) || '@student.tiptopvirtualacademy.com.ng';

        -- Update guided student item with provisioned references
        UPDATE public.guided_enrollment_students
        SET 
            provisioned_student_id = v_new_student_id,
            google_classroom_assigned = true,
            google_classroom_email = v_google_email
        WHERE id = v_student_item.id;

        -- Send Welcome Notification to Parent
        INSERT INTO public.notifications (profile_id, title, body, type)
        VALUES (
            v_enrollment.parent_id,
            'Student Provisioned: ' || v_student_item.first_name,
            'Your child ' || v_student_item.first_name || ' has been successfully admitted and provisioned into Tiptop Virtual Academy. Google Classroom ID: ' || v_google_email,
            'provisioning'
        );
    END LOOP;

    -- Mark enrollment completed
    UPDATE public.guided_enrollments SET status = 'completed', updated_at = now() WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
