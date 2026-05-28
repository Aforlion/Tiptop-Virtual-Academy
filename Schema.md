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