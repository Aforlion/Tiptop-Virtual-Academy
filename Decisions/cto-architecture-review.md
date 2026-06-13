# Decisions: Startup CTO Architecture Review

**Project:** Tiptop Virtual Academy  
**Category:** Decisions  
**Owner:** Startup CTO  
**Status:** Proposed  
**Created:** 2026-06-13  
**Review Date:** 2026-09-13  
**Related Assets:** [Schema.md](file:///c:/Projects/Tiptop%20Virtual%20Academy/Schema.md)

## Executive Summary
This technical assessment evaluates the scalability and security of the database design and application boundaries in Tiptop Virtual Academy. The codebase represents a clean Next.js/Supabase architecture, but security vulnerabilities in credit mutation and schema constraints for age validation require immediate structural corrections.

---

## Findings

### Critical Severity
- **Direct Credit Mutation:** The `flexible_credits` column in `public.profiles` is decremented in-place. If queries fail halfway through, or users exploit API connection closures, it can cause database desynchronization. Lack of double-entry ledger logs is a critical operational risk.

### High Severity
- **Availability Schedule Collisions:** The current unique constraint `UNIQUE(teacher_id, day_of_week, start_time)` does not prevent calendar overlapping (e.g. scheduling 13:00 - 14:00 and 13:30 - 14:30).

### Medium Severity
- **Age Constrained Course Logic:** The database schema has constraints restricting courses to `min_age` and `max_age` check constraints. These need adjustment to support teen brackets (up to age 16).

---

## Risks
1. **Financial Discrepancy Risk:** Direct updates to user profile credit balances without logs make financial audits impossible.
2. **Double Booking Risk:** Teachers could accidentally schedule overlapping sessions because time blocks are not validated for overlaps.

---

## Recommendations
1. **Ledger Table Migration:** Create a `public.credit_ledger` table and refactor bookings/refunds to perform inserts via a single transactional RPC function.
2. **Overlay Checking Function:** Implement a PostgreSQL constraint/trigger that checks if a teacher's scheduled start and end times conflict with their existing `live_sessions` or `teacher_availability`.

---

## Action Plan

### Next 7 Days
- Develop and deploy `migration_009_credit_ledger.sql` containing the ledger schema and triggers to update the profile total atomically.
- Refactor the backend `book_flexible_session` RPC to use the new ledger tables.

### Next 30 Days
- Add a Postgres validation trigger to prevent teacher scheduling overlaps.
- Adjust check constraints on `courses` to support age ranges up to 16.

### Next 90 Days
- Implement server-side Jitsi telemetry webhooks to log actual connection durations instead of client-side tracking.

---

## CTO Verdict
**Production with Caution** (Pending implementation of the Credit Ledger table).
