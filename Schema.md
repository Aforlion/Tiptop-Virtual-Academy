# Database Schema Document

This document defines the database architecture for Tiptop Virtual Academy.

## Tables

### 1. `public.profiles`
Represents the user account profiles mapping directly to `auth.users` logins.
*   `id` `UUID` (Primary Key, foreign key referencing `auth.users(id)` on delete cascade)
*   `first_name` `TEXT` (Not Null)
*   `last_name` `TEXT` (Not Null)
*   `role` `TEXT` (Default `'parent'`, check constraint for `'parent'`, `'student'`, `'teacher'`, `'admin'`)
*   `phone_number` `TEXT` (Nullable)
*   `avatar_url` `TEXT` (Nullable)
*   `flexible_credits` `INT` (Default `0`, check constraint `flexible_credits >= 0` — Rule 1: Credit Guard)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

### 2. `public.students`
Children/Student profiles linked to a Parent profile in a one-to-many relationship.
*   `id` `UUID` (Primary Key, default `gen_random_uuid()`)
*   `parent_id` `UUID` (Foreign key referencing `public.profiles(id)` on delete cascade, Not Null)
*   `first_name` `TEXT` (Not Null)
*   `date_of_birth` `DATE` (Not Null)
*   `notes` `TEXT` (Nullable)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

### 3. `public.courses`
Blueprints of subjects/curricula that can be taught.
*   `id` `UUID` (Primary Key, default `gen_random_uuid()`)
*   `title` `TEXT` (Not Null)
*   `description` `TEXT` (Nullable)
*   `min_age` `INT` (Not Null)
*   `max_age` `INT` (Not Null)
*   `is_published` `BOOLEAN` (Default `false`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

### 4. `public.live_sessions`
Active instances of live classroom broadcasts scheduled by teachers or administrators.
*   `id` `UUID` (Primary Key, default `gen_random_uuid()`)
*   `course_id` `UUID` (Foreign key referencing `public.courses(id)` on delete cascade, Not Null)
*   `teacher_name` `TEXT` (Not Null)
*   `meeting_token` `TEXT` (Not Null) — Maps to the Jitsi Meet room name
*   `scheduled_start` `TIMESTAMPTZ` (Not Null)
*   `scheduled_end` `TIMESTAMPTZ` (Not Null)
*   `session_type` `TEXT` (Check constraint for `'cohort'` or `'flexible'`, Not Null)
*   `max_seats` `INT` (Default `15`)
*   `status` `TEXT` (Default `'scheduled'`, check constraint for `'scheduled'`, `'live'`, `'completed'`, `'cancelled'`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

### 5. `public.cohort_enrollments`
Bypasses credits; binds students to term-based courses. (Rule 2: Cohort Isolation).
*   `id` `UUID` (Primary Key, default `gen_random_uuid()`)
*   `student_id` `UUID` (Foreign key referencing `public.students(id)` on delete cascade, Not Null)
*   `course_id` `UUID` (Foreign key referencing `public.courses(id)` on delete cascade, Not Null)
*   `enrolled_at` `TIMESTAMPTZ` (Default `now()`)
*   `UNIQUE(student_id, course_id)`

### 6. `public.student_bookings`
Active session bookings representing scheduled class attendance reservation.
*   `id` `UUID` (Primary Key, default `gen_random_uuid()`)
*   `student_id` `UUID` (Foreign key referencing `public.students(id)` on delete cascade, Not Null)
*   `session_id` `UUID` (Foreign key referencing `public.live_sessions(id)` on delete cascade, Not Null)
*   `attended` `BOOLEAN` (Default `false`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)
*   `UNIQUE(student_id, session_id)`

---

## Row Level Security (RLS) Policies

All tables have Row Level Security enabled. Below are the access rules:

*   **`profiles`**:
    *   `SELECT`: User can view their own profile, or admins can view all.
    *   `INSERT` / `UPDATE`: User can modify their own profile, or admins can modify all.
*   **`students`**:
    *   `ALL`: Parents can CRUD students where `parent_id = auth.uid()`. Admins can CRUD all.
*   **`courses`**:
    *   `SELECT`: Any authenticated user can read courses.
    *   `INSERT`/`UPDATE`/`DELETE`: Only admins can write.
*   **`live_sessions`**:
    *   `SELECT`: Any authenticated user can read live sessions.
    *   `INSERT`/`UPDATE`/`DELETE`: Only admins can write.
*   **`cohort_enrollments`**:
    *   `SELECT`: Parents can view enrollments for their children, or admins can view all.
    *   `INSERT`/`UPDATE`/`DELETE`: Only admins can write.
*   **`student_bookings`**:
    *   `ALL`: Parents can manage bookings for their children. Admins can manage all.

---

## Stored Procedures / Functions

### 1. `book_flexible_session(p_student_id UUID, p_session_id UUID, p_parent_id UUID)`
Atomically deducts a credit, checks constraints, and books a session in one transaction (prevents race conditions).
*   **Behavior**: Locks credit record `FOR UPDATE`. Verifies student belongs to parent. Verifies session is flexible. Deducts 1 credit, inserts booking.

### 2. `cancel_flexible_booking(p_booking_id UUID, p_parent_id UUID)`
Atomically cancels a booking and refunds the parent's flexible credit if the booking type was `flexible`.

### 3. `handle_new_user()`
Auth trigger executed `AFTER INSERT` on `auth.users`. Robustly parses metadata (e.g. `first_name`, `last_name`, `full_name`, `name`, `given_name`, `family_name`) to construct user profiles automatically. Assigns 10 free starting credits if role is `parent`.

### 4. `handle_session_completion()`
Trigger executed `AFTER UPDATE` on `public.live_sessions`. When `status` transitions to `'completed'` and a `teacher_id` is set, automatically inserts a provisional row into `teacher_earnings` with a default base fee (₦5,000) plus a 30% credit-share calculation. Uses `ON CONFLICT DO NOTHING` to prevent double-crediting.

---

## Phase 2 Tables (migration_004_teacher_portal.sql)

### 7. `public.teacher_availability`
Weekly recurring availability blocks declared by a teacher.
*   `id` `UUID` (Primary Key)
*   `teacher_id` `UUID` (FK → `public.profiles(id)` ON DELETE CASCADE, Not Null)
*   `day_of_week` `SMALLINT` (0=Sun … 6=Sat, CHECK 0–6)
*   `start_time` `TIME` (Not Null)
*   `end_time` `TIME` (Not Null)
*   `timezone` `TEXT` (Default `'Africa/Lagos'`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)
*   `UNIQUE(teacher_id, day_of_week, start_time)`

RLS: Teachers manage their own rows; admins see all.

### 8. `public.teacher_earnings`
Immutable earnings ledger auto-populated by the `on_session_completed` trigger.
*   `id` `UUID` (Primary Key)
*   `teacher_id` `UUID` (FK → `public.profiles(id)` ON DELETE CASCADE)
*   `session_id` `UUID` (FK → `public.live_sessions(id)` ON DELETE CASCADE)
*   `base_fee_cents` `INT` (Default 0)
*   `credit_share_cents` `INT` (Default 0)
*   `total_cents` `INT` GENERATED ALWAYS AS (`base_fee_cents + credit_share_cents`) STORED
*   `paid_out` `BOOLEAN` (Default `false`)
*   `notes` `TEXT` (Nullable)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)
*   `UNIQUE(teacher_id, session_id)`

RLS: Teachers view their own rows; admins manage all.

---

## Phase 3 Tables (migration_005_gamification.sql)

### 9. `public.student_xp_transactions`
XP ledger documenting point allocations.
*   `id` `UUID` (Primary Key)
*   `student_id` `UUID` (FK → `public.students(id)` ON DELETE CASCADE, Not Null)
*   `amount` `INT` (Not Null, CHECK `amount != 0`)
*   `reason` `TEXT` (Not Null, values like `'attendance'`, `'badge_earned'`, `'challenge_completed'`, `'streak_bonus'`)
*   `reference_id` `UUID` (Nullable reference to e.g. booking_id or challenge_id)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Parents/students view own student's XP logs; admins view all.

### 10. `public.challenges`
Pre-defined milestones and quests that award bonus XP.
*   `id` `UUID` (Primary Key)
*   `title` `TEXT` (Not Null)
*   `description` `TEXT` (Not Null)
*   `xp_reward` `INT` (Not Null, CHECK `xp_reward > 0`)
*   `target_count` `INT` (Not Null, CHECK `target_count > 0`)
*   `key_code` `TEXT` (Unique, Not Null)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Anyone can view challenges.

### 11. `public.student_challenges`
Tracks student progress on active challenges.
*   `id` `UUID` (Primary Key)
*   `student_id` `UUID` (FK → `public.students(id)` ON DELETE CASCADE, Not Null)
*   `challenge_id` `UUID` (FK → `public.challenges(id)` ON DELETE CASCADE, Not Null)
*   `progress_count` `INT` (Default 0, Not Null)
*   `completed` `BOOLEAN` (Default `false`, Not Null)
*   `completed_at` `TIMESTAMPTZ` (Nullable)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)
*   `UNIQUE(student_id, challenge_id)`

RLS: Parents/students view own student's challenges; admins view all.

---

## Triggers and Functions (migration_005_gamification.sql)

### 5. `sync_student_cumulative_xp()`
Trigger function executed `AFTER INSERT` on `public.student_xp_transactions`. Automatically updates the cumulative `xp` on the corresponding `public.students` record.

### 6. `handle_challenge_completion()`
Trigger function executed `BEFORE UPDATE` on `public.student_challenges`. If `progress_count` meets or exceeds `target_count` and `completed` is currently `false`, marks the challenge as completed and posts an XP transaction to the ledger automatically.

### 7. `process_student_bookings_gamification()`
Trigger function executed `AFTER INSERT OR UPDATE` on `public.student_bookings`. 
*   **Attendance**: When `attended` is updated to `true`, logs a transaction for `100 XP` and increments the student's progress for the `'attend_classes'` challenge.
*   **Badges**: Compares new and old badges and awards `50 XP` per newly rewarded badge. If specific badge challenges are active, marks them as completed.

---

## Community & Administration Tables (migration_006_community.sql)

### 12. `public.chat_messages`
Real-time class session messaging chat rooms.
*   `id` `UUID` (Primary Key)
*   `session_id` `UUID` (FK → `public.live_sessions(id)` ON DELETE CASCADE, Not Null)
*   `sender_id` `UUID` (FK → `public.profiles(id)` ON DELETE CASCADE, Not Null)
*   `sender_name` `TEXT` (Not Null)
*   `sender_role` `TEXT` (Not Null, CHECK: `'teacher'`, `'parent'`, `'admin'`, `'student'`)
*   `body` `TEXT` (Not Null, CHECK: length 1-1000)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Authenticated users can select messages; inserts allowed when `auth.uid() = sender_id`.

### 13. `public.forum_channels`
Named bulletin/discussion channels.
*   `id` `UUID` (Primary Key)
*   `course_id` `UUID` (FK → `public.courses(id)` ON DELETE CASCADE, Nullable)
*   `name` `TEXT` (Unique, Not Null)
*   `description` `TEXT` (Nullable)
*   `channel_type` `TEXT` (CHECK: `'course_qa'`, `'tribe'`, `'announcements'`)
*   `emoji` `TEXT` (Default `'💬'`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Anyone can read; only admins can write.

### 14. `public.forum_posts`
Forum discussion threads.
*   `id` `UUID` (Primary Key)
*   `channel_id` `UUID` (FK → `public.forum_channels(id)` ON DELETE CASCADE, Not Null)
*   `author_id` `UUID` (FK → `public.profiles(id)` ON DELETE CASCADE, Not Null)
*   `author_name` `TEXT` (Not Null)
*   `author_role` `TEXT` (Not Null)
*   `title` `TEXT` (Not Null, CHECK: length 3-200)
*   `body` `TEXT` (Not Null, CHECK: length 1-5000)
*   `pinned` `BOOLEAN` (Default `false`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Authenticated users can read/write; authors & admins can delete; admins can update (pin).

### 15. `public.forum_replies`
Threaded post responses.
*   `id` `UUID` (Primary Key)
*   `post_id` `UUID` (FK → `public.forum_posts(id)` ON DELETE CASCADE, Not Null)
*   `author_id` `UUID` (FK → `public.profiles(id)` ON DELETE CASCADE, Not Null)
*   `author_name` `TEXT` (Not Null)
*   `author_role` `TEXT` (Not Null)
*   `body` `TEXT` (Not Null, CHECK: length 1-3000)
*   `is_answer` `BOOLEAN` (Default `false`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Authenticated users can read/write; authors & admins can delete; admins & teachers can update (`is_answer`).

### 16. `public.certificate_templates`
Course certificate print blueprints designed by administrators.
*   `id` `UUID` (Primary Key)
*   `course_id` `UUID` (FK → `public.courses(id)` ON DELETE CASCADE, Unique, Not Null)
*   `title_text` `TEXT` (Not Null, Default `'Certificate of Completion'`)
*   `body_text` `TEXT` (Not Null, Default: support `{student_name}` and `{course_title}`)
*   `signatory_name` `TEXT` (Not Null)
*   `signatory_title` `TEXT` (Not Null)
*   `accent_color` `TEXT` (Not Null, Default `'#7c3aed'`)
*   `created_at` `TIMESTAMPTZ` (Default `now()`)

RLS: Authenticated users can read; only admins can write.