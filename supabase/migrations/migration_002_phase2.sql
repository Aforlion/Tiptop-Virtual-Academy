-- Tiptop Virtual Academy — Phase 2 Database Migration
-- To be executed manually in the Supabase SQL Editor.

-- 1. ALTER EXISTING TABLES

-- Add earned_badges array to student_bookings for grading/rewards
ALTER TABLE public.student_bookings 
ADD COLUMN IF NOT EXISTS earned_badges TEXT[] DEFAULT '{}';


-- 2. CREATE NEW TABLES

-- Credit Packages table (Admin defines pricing tiers)
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table (Tracks Paystack transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.credit_packages(id) ON DELETE RESTRICT,
    reference TEXT UNIQUE NOT NULL, -- Paystack reference ID
    amount_cents INT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. ENABLE ROW LEVEL SECURITY

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;


-- 4. RLS POLICIES

-- Credit Packages Policies
-- Anyone can view active packages
CREATE POLICY "Public can view active credit packages"
    ON public.credit_packages FOR SELECT
    USING (is_active = true OR (auth.jwt() ->> 'role') = 'admin');

-- Only admins can manage packages
CREATE POLICY "Admins can manage credit packages"
    ON public.credit_packages FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Payments Policies
-- Parents can view their own payments
CREATE POLICY "Parents view own payments"
    ON public.payments FOR SELECT
    USING (parent_id = auth.uid());

-- Only admins can view/manage all payments
CREATE POLICY "Admins can manage all payments"
    ON public.payments FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');


-- 5. SEED INITIAL CREDIT PACKAGES

INSERT INTO public.credit_packages (name, description, credits, price_cents)
VALUES 
    ('Starter Pack', 'Get started with 5 flexible class credits', 5, 250000), -- e.g. 25000 NGN or 25.00 USD
    ('Growth Pack', 'Most popular! 12 flexible class credits', 12, 500000),
    ('Academy Pro', 'Immersive learning with 30 flexible class credits', 30, 1000000)
ON CONFLICT DO NOTHING;
