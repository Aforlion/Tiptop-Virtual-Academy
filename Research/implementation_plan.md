# Implementation Plan: Tiptop Virtual Academy - PRD & Architecture Improvements

This document contains a comprehensive deep research report and architectural review of the Tiptop Virtual Academy codebase, highlighting key improvement vectors for the Product Requirements Document (PRD) and tech stack schema.

## Executive Summary of Deep Research

Following a comprehensive analysis of the cloned workspace, database migration scripts, Next.js page hierarchy, and type declarations, we have assessed the current maturity state of the Tiptop Virtual Academy application. 

### Key Findings & Codebase Inventory
1. **Application Architecture:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4.
2. **Design System:** Custom CSS design system located in [globals.css](file:///c:/Projects/Tiptop%20Virtual%20Academy/src/app/globals.css) providing glassmorphism interfaces, customizable color tokens, and two distinct student dashboards:
   - **Junior (Ages 3-6):** Cream and bubble gradients, soft borders, large rounded components.
   - **Senior (Ages 7-12):** Sleek space cadet theme with cyber grids, cyan gradients.
3. **Database Layer:** Supabase-backed schema containing 16 main tables (including RLS, stored procedures for credits and triggers).
4. **Current Gaps vs. Vision:**
   - **Age Scope Extension (Ages 3-16):** The user updated the PRD to support ages up to 16. The current code and schema limit the senior dashboard to age 12 (`max_age: 12`). There is no interface or schema provisions for **Teen Learners (Ages 13-16)**, who require a mature, utility-focused dashboard resembling professional developer tools (LMS style) rather than gamified elements.
   - **Teacher Availability:** Availability is stored but lack of calendar conflict resolution checks in Edge functions or triggers.
   - **Assessments Security:** The quiz system is stored in client memory or basic tables but lacks anti-cheat or auto-saving mechanisms for long-duration tests.

---

## User Review Required

> [!IMPORTANT]
> **Expanding Target Audience to Ages 3-16**
> - We propose introducing a third Age-Adapted UI Bracket: **Teen (Ages 13-16)**.
> - The Teen theme will transition from the playful/cyberpunk gamified UI into a focused, workspace-like LMS (Dark/Light professional developer aesthetic) with modules for Git/GitHub project links, advanced code reviews, and structured peer collaboration.

> [!TIP]
> **Credit Transaction Security & Auditing**
> - The current `flexible_credits` deduction is performed in SQL via `book_flexible_session`. However, there is no ledger table for credit transactions. If credits disappear or fail, there is no audit log. We propose creating a `public.credit_ledger` table.

---

## Open Questions

> [!WARNING]
> 1. **Teens Portfolio Feature:** Should teen learners (13-16) have a showcase portfolio where they can link GitHub repositories or host completed websites directly in the academy?
> 2. **Jitsi Meet Custom Integration:** The classroom utilizes a meeting token mapped to Jitsi. Should we formalize Jitsi iframe API event listeners in the frontend to track student active attendance time automatically?

---

## Proposed Changes

### Component 1: Product Requirements Document (PRD)

#### [MODIFY] [PRD.md](file:///c:/Projects/Tiptop%20Virtual%20Academy/PRD.md)
- Update Age-Adapted UI section to include three tiers:
  - **Junior (3-6)**: Playful, audio-assisted, gamified.
  - **Senior (7-12)**: Cyber-grid dashboard, achievement cards, challenges.
  - **Teen (13-16)**: Developer-centric portfolio, project logs, certificate showcase.
- Document the new auditing ledger for billing/credit system.
- Add live session connection metrics tracking requirements (Jitsi iframe API integration).

### Component 2: Database Schema

#### [MODIFY] [Schema.md](file:///c:/Projects/Tiptop%20Virtual%20Academy/Schema.md)
- Detail the structure of the proposed `public.credit_ledger` table to audit credit adjustments:
  - `id` `UUID`
  - `parent_id` `UUID` (FK)
  - `amount` `INT` (positive/negative)
  - `transaction_type` `TEXT` (e.g. `'purchase'`, `'booking_fee'`, `'refund'`, `'admin_adjustment'`)
  - `reference_id` `UUID` (nullable link to booking or payment)
  - `created_at` `TIMESTAMPTZ`

### Component 3: Frontend Styles & UI Switcher

#### [MODIFY] [globals.css](file:///c:/Projects/Tiptop%20Virtual%20Academy/src/app/globals.css)
- Implement a third theme: `.teen-theme` focusing on professional design, high-contrast dark/light mode accents, code-editor integrations, and minimal gamification.

---

## Verification Plan

### Automated Tests
- Run `pnpm run build` or `npm run build` to verify there are no compilation or syntax issues with the project setup.

### Manual Verification
- Render the new Teen Dashboard theme using the `testAge=teen` or `testAge=older` URL query params.
