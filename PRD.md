# Product Requirement Document (PRD): Tiptop Virtual Academy

## 1. Executive Summary & Vision
An online learning academy specialized for learners aged 3 to 12. The platform operates on a hybrid instructional architecture: hosting long-term fixed cohorts alongside flexible, open-booking live interactive classrooms.

The software acts as a technical partner on top of pedagogical domain expertise. It structures a strict operational split: parents manage billing, timetables, and authentication, while children interact with live video streams.

**Tech Stack:** Next.js 14 (App Router) + Supabase (Auth, Database, Real-time, Storage)

---

## 2. Core Archetypes & User Roles
1. **Parent (The Facilitator):** Handles billing, profile management, seat booking, credit transactions, and triggers class launches.
2. **Student (The Learner):** Accesses child-optimized dashboards tailored to age brackets (3-6 vs. 7-12) and interacts with the embedded live session.
3. **Teacher (The Provider):** Configures scheduling blocks, launches interactive classrooms, signs up for long-term cohorts, and views pending payouts.
4. **Admin (Barbara / System Owner):** Manages user validation, handles platform configuration, builds curricula, and monitors financial ledgers.

---

## 3. Complete Feature Catalog

### A. Authentication & User Management
- Email/password sign-up and sign-in (Supabase Auth)
- Google and GitHub social OAuth
- Magic link sign-in
- Password reset via email
- Role-based access control (Parent, Student, Teacher, Admin)
- User profiles with avatar, bio, date of birth
- Organization settings (name, logo, brand, timezone)

### B. Parent Portal ("Unified Mission Control")
- Chronological dashboard displaying active schedules
- Credit balance display with `flexible_credits` tracking
- Child student profile management (one-to-many: parent → students)
- Class alerts and notifications
- Booking management (view, create, cancel)

### C. Student Dashboard
- **Age-Adapted UI:** Dynamic layout based on `date_of_birth` (3-6 vs. 7-12 brackets)
- Welcome greeting with personalized avatar
- Session countdown timer ("Session begins in 10 mins")
- Upcoming classes schedule
- News Center with academy announcements

### D. "One-Click to Class" Launch Engine
- Real-time conditional block that appears 10 minutes before a class
- Oversized connection launcher button
- Embedded Classroom Dock: child-safe iframe/Video SDK window
- Children never navigate outside the portal shell

### E. Course & Curriculum Management (Admin/Teacher)
- Course creation with structured curriculum builder
- Rich content blocks: text, accordion, image slider, pledge cards, LaTeX math
- Labs section for interactive exercises
- Module and lesson organization
- Course catalog with enrollment

### F. Assessment & Quiz Engine
- Multiple question types: MCQ (single answer), MCQ (multiple answer), TIP (fill-in), reading comprehension
- Multi-level assessments (Level 1, 2, 3…)
- Question navigation grid with numbered buttons
- Timed assessments with countdown
- Question status tracking: Visited, Unvisited, Answered, Unanswered
- Mark for Review feature
- Difficulty ratings per question (Easy, Medium, Hard)
- Score display with percentage (donut chart)
- Score breakdown: Correct / Incorrect / Skipped
- User Response Summary table (question type, correct answer, user answer, status, difficulty, time spent)
- Detailed analytics: Overall Summary, Detailed Analytics, Reports
- Session Logs with timestamped timeline view

### G. Code Editor & Submissions (Future)
- Online code editor with file tree, syntax highlighting
- Run, Test, Submit functionality
- Multi-format submissions: video, audio, text
- Review system with feedback panel and annotations

### H. Gamification & Rewards
- XP (Experience Points) system with weekly tracking
- Leaderboards with League tiers (Bronze, Silver, Gold…)
- Global and class-level rankings
- Challenges with XP rewards ("Solve 10 math problems in 24 hours")
- Badges collection system (Thunder Fast Learner, Consistent Streaky, etc.)
- Weekly rewards display

### I. Scheduling & Calendar
- Calendar view (week/month) with event creation
- Class scheduling with conflict prevention
- Recurring cohort assignments vs. flex calendar
- Teacher availability blocks

### J. Community & Communication
- Discussion forums with channels (General, Classroom-specific)
- Q&A system with verified answers
- Classroom Chat Room (text, audio messages, images)
- Group management ("Make your own tribe")
- Announcements and news feed
- Social interactions: Like, Comment, Share, Save

### K. Certificates & Recognition
- Certificate template designer
- Auto-generation on course completion
- Customizable fields (name, date, course, signature)
- Download as PDF

### L. Store (Future)
- Digital content marketplace
- In-app purchases with credits

### M. Teacher Portal (Phase 2)
- Scheduling block configuration
- Interactive classroom launcher
- Pending payouts dashboard
- Cohort sign-up management
- Earnings split calculator (flat fees + credit-share margins)

---

## 4. Database Architecture & Business Logic Ledger
All ledger actions must operate via atomic database executions to prevent data loss or invalid scheduling entries.

### Business Rules:
- **Rule 1 (The Credit Guard):** Flexible bookings consume `flexible_credits`. Balance cannot drop below 0.
- **Rule 2 (The Cohort Isolation):** Term passes grant entry to a static roster mapped via `cohort_enrollments`. They bypass the credit allocation column completely.
- **Rule 3 (Age Adaptation):** The UI layout dynamically renders components based on the `date_of_birth` calculation of the student active profile.

---

## 5. MVP Scope (Phase 1 — BUILD NOW)

> The MVP focuses on the minimum viable loop: Barbara (admin) can create courses and schedule classes. Parents can register, add children, and book sessions. Students can see their dashboard and join a class.

### MVP Features:
1. **Auth:** Email/password registration and login for all roles (Supabase Auth)
2. **Admin Panel:** Barbara can manage users, create courses, schedule live sessions
3. **Parent Dashboard:** View children, see upcoming classes, credit balance, book sessions
4. **Student Dashboard:** Age-adapted view, upcoming schedule, "One-Click to Class" launcher
5. **Course Catalog:** Browse available courses and sessions
6. **Booking System:** Parents book flex sessions (credit deduction) or enroll in cohorts

### MVP Deferred (Phase 2+):
- Assessment/Quiz engine
- Code editor & submissions
- Gamification (XP, leaderboards, badges)
- Community forums & chat
- Certificates
- Teacher portal & payouts
- Store

---

## 6. Supabase Project
- **Project ID:** lnuckqstvjvmrbbseedi
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudWNrcXN0dmp2bXJiYnNlZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjExOTQsImV4cCI6MjA5NTAzNzE5NH0.rn4C6RsE0J21qfHpUbEE4ga-5sCoazLWoVN5-Qm_I0s