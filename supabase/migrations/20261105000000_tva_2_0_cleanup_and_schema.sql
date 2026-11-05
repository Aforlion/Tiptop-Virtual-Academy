-- ==============================================================================
-- TIPTOP VIRTUAL ACADEMY (TVA 2.0) - MASTER SCHEMA MIGRATION & CLEANUP
-- ==============================================================================

-- 1. DROP OBSOLETE & UNUSED V1 TABLES (Bloat, legacy credits & gamification)
DROP TABLE IF EXISTS student_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS student_xp_transactions CASCADE;
DROP TABLE IF EXISTS credit_ledger CASCADE;
DROP TABLE IF EXISTS credit_packages CASCADE;
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_channels CASCADE;
DROP TABLE IF EXISTS guided_enrollment_students CASCADE;
DROP TABLE IF EXISTS guided_enrollments CASCADE;
DROP TABLE IF EXISTS student_bookings CASCADE;
DROP TABLE IF EXISTS teacher_earnings CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- ==============================================================================
-- 2. ENHANCE CORE ADMISSIONS TABLE FOR DIRECT PAYSTACK ONBOARDING
-- ==============================================================================
ALTER TABLE IF EXISTS admissions_applications
  ALTER COLUMN parent_profile_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS parent_phone text,
  ADD COLUMN IF NOT EXISTS parent_country text DEFAULT 'Nigeria',
  ADD COLUMN IF NOT EXISTS key_stage_code text,
  ADD COLUMN IF NOT EXISTS delivery_format text DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS selected_subjects text[],
  ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS paystack_reference text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS idx_admissions_paystack_ref ON admissions_applications(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_admissions_parent_email ON admissions_applications(parent_email);

-- ==============================================================================
-- 3. ENHANCE INVOICES FOR MULTI-CURRENCY PAYSTACK RECONCILIATION
-- ==============================================================================
ALTER TABLE IF EXISTS invoices
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS paystack_reference text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS term_period text;

CREATE INDEX IF NOT EXISTS idx_invoices_paystack_ref ON invoices(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_invoices_parent ON invoices(parent_id);

-- ==============================================================================
-- 4. CREATE CENTRALIZED RESOURCE VAULT (Slides, Recordings, Worksheets)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS resource_vault (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key_stage_code text NOT NULL,
  subject_code text NOT NULL,
  title text NOT NULL,
  description text,
  resource_type text NOT NULL CHECK (resource_type IN ('video', 'slides', 'worksheet', 'curriculum_guide')),
  file_url text NOT NULL,
  week_number integer,
  term_number integer DEFAULT 1,
  academic_year text DEFAULT '2026/2027',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_vault_stage_subject ON resource_vault(key_stage_code, subject_code);

-- ==============================================================================
-- 5. UPDATE CATEGORY CONSTRAINT & SEED NIGERIAN CURRICULUM SUBJECTS
-- ==============================================================================
ALTER TABLE IF EXISTS curriculum_subjects 
  DROP CONSTRAINT IF EXISTS curriculum_subjects_category_check;

ALTER TABLE IF EXISTS curriculum_subjects 
  ADD CONSTRAINT curriculum_subjects_category_check 
  CHECK (category IN ('core', 'foundation', 'elective', 'nigerian'));

INSERT INTO curriculum_subjects (code, name, description, category)
SELECT 'NIG-SOC', 'Nigerian Social Studies & Civic Education', 'Civic rights, Nigerian constitution, values, and community heritage', 'nigerian'
WHERE NOT EXISTS (SELECT 1 FROM curriculum_subjects WHERE code = 'NIG-SOC');

INSERT INTO curriculum_subjects (code, name, description, category)
SELECT 'NIG-HIST', 'Nigerian History & Cultural Studies', 'Pre-colonial empires, post-independence history, and cultural heritage', 'nigerian'
WHERE NOT EXISTS (SELECT 1 FROM curriculum_subjects WHERE code = 'NIG-HIST');

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE resource_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Allow public reads on published learning resources
DROP POLICY IF EXISTS "Public can view published resources" ON resource_vault;
CREATE POLICY "Public can view published resources" ON resource_vault
  FOR SELECT USING (is_published = true);

-- Allow anyone (public applicants) to submit an admissions application
DROP POLICY IF EXISTS "Public can submit applications" ON admissions_applications;
CREATE POLICY "Public can submit applications" ON admissions_applications
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own admissions applications
DROP POLICY IF EXISTS "Users can view their own applications" ON admissions_applications;
CREATE POLICY "Users can view their own applications" ON admissions_applications
  FOR SELECT USING (auth.uid() = parent_profile_id OR parent_email = (auth.jwt() ->> 'email'));

-- Allow service role full access on admissions
DROP POLICY IF EXISTS "Service role full access on admissions" ON admissions_applications;
CREATE POLICY "Service role full access on admissions" ON admissions_applications
  FOR ALL USING (true);

-- Allow parents to view their own invoices
DROP POLICY IF EXISTS "Parents can view own invoices" ON invoices;
CREATE POLICY "Parents can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = parent_id);

-- Allow service role full access on invoices
DROP POLICY IF EXISTS "Service role full access on invoices" ON invoices;
CREATE POLICY "Service role full access on invoices" ON invoices
  FOR ALL USING (true);
