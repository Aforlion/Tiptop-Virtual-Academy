-- Migration 013: Admissions Module

CREATE TYPE public.admissions_status AS ENUM ('submitted', 'under_review', 'assessment_scheduled', 'approved', 'rejected');

CREATE TABLE public.admissions_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_first_name TEXT NOT NULL,
    student_last_name TEXT NOT NULL,
    student_date_of_birth DATE NOT NULL,
    status public.admissions_status NOT NULL DEFAULT 'submitted',
    documents_urls TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admissions_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can CRUD their own applications"
    ON public.admissions_applications
    FOR ALL
    TO authenticated
    USING (parent_profile_id = auth.uid())
    WITH CHECK (parent_profile_id = auth.uid());

CREATE POLICY "Admins can CRUD all applications"
    ON public.admissions_applications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger function to auto-provision student on approval
CREATE OR REPLACE FUNCTION public.create_student_on_admission_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved'::public.admissions_status AND OLD.status != 'approved'::public.admissions_status THEN
        INSERT INTO public.students (parent_id, first_name, date_of_birth)
        VALUES (NEW.parent_profile_id, NEW.student_first_name, NEW.student_date_of_birth);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_admission_approved
    AFTER UPDATE ON public.admissions_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.create_student_on_admission_approval();
