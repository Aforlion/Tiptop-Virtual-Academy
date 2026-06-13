# Decisions: Credit Ledger Database Schema

**Project:** Tiptop Virtual Academy  
**Category:** Decisions  
**Owner:** Startup CTO  
**Status:** Proposed  
**Created:** 2026-06-13  
**Review Date:** 2026-09-13  
**Related Assets:** [Schema.md](file:///c:/Projects/Tiptop%20Virtual%20Academy/Schema.md)

## Summary
To prevent fraud, guarantee transactional safety, and enable auditing of user purchases and bookings, we propose transitioning from direct, un-logged column updates on the `profiles.flexible_credits` column to a dedicated ledger-style tracking table (`public.credit_ledger`).

## Proposed Schema Design

```sql
CREATE TABLE public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- Positive for credits purchased/refunded, negative for bookings
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'booking_fee', 'refund', 'admin_adjustment')),
    reference_id UUID, -- Link to session_booking ID or payment ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own ledger logs"
ON public.credit_ledger FOR SELECT
TO authenticated
USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage all ledger logs"
ON public.credit_ledger FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Impact & Actions
1. **Startup CTO** will review the schema and integrate it into the next database migration (`migration_009_credit_ledger.sql`).
2. **Product Engineer** will update the client query libraries to compute current credit balances or display ledger history in the Parent portal.
