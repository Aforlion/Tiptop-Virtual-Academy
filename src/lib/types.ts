export type UserRole = 'parent' | 'student' | 'teacher' | 'admin';
export type SessionType = 'cohort' | 'flexible';
export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number: string | null;
  avatar_url: string | null;
  flexible_credits: number;
  created_at: string;
}

export interface Student {
  id: string;
  parent_id: string;
  first_name: string;
  date_of_birth: string;
  notes: string | null;
  xp?: number; // Cumulative Experience Points
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  min_age: number;
  max_age: number;
  is_published: boolean;
  created_at: string;
}

export interface LiveSession {
  id: string;
  course_id: string;
  teacher_name: string;
  meeting_token: string;
  scheduled_start: string;
  scheduled_end: string;
  session_type: SessionType;
  max_seats: number;
  status: SessionStatus;
  created_at: string;
}

export interface CohortEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface StudentBooking {
  id: string;
  student_id: string;
  session_id: string;
  attended: boolean;
  earned_badges: string[];
  created_at: string;
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned';

export interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  parent_id: string;
  package_id: string;
  reference: string;
  amount_cents: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

// Joined query result types
export interface LiveSessionWithCourse extends LiveSession {
  courses: Course;
}

export interface BookingWithDetails extends StudentBooking {
  students: Student;
  live_sessions: LiveSessionWithCourse;
}

export interface CohortEnrollmentWithCourse extends CohortEnrollment {
  courses: Course;
}

// ---- Teacher Portal Phase 2 ----

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun … 6=Sat

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: DayOfWeek;
  start_time: string; // 'HH:MM:SS'
  end_time: string;   // 'HH:MM:SS'
  timezone: string;
  created_at: string;
}

export interface TeacherEarning {
  id: string;
  teacher_id: string;
  session_id: string;
  base_fee_cents: number;
  credit_share_cents: number;
  total_cents: number;
  paid_out: boolean;
  notes: string | null;
  created_at: string;
  // joined
  live_sessions?: LiveSessionWithCourse;
}

export interface CohortEnrollmentWithStudent extends CohortEnrollment {
  students: Student;
  courses: Course;
}

export interface StudentXPTransaction {
  id: string;
  student_id: string;
  amount: number;
  reason: 'attendance' | 'badge_earned' | 'challenge_completed' | 'streak_bonus';
  reference_id: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  target_count: number;
  key_code: string;
  created_at: string;
}

export interface StudentChallenge {
  id: string;
  student_id: string;
  challenge_id: string;
  progress_count: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  challenges?: Challenge;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  first_name: string;
  total_xp: number;
  weekly_xp: number;
  league_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  is_current_student: boolean;
}

// ---- Community & Administration ----

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'teacher' | 'parent' | 'admin' | 'student';
  body: string;
  created_at: string;
}

export interface ForumChannel {
  id: string;
  course_id: string | null;
  name: string;
  description: string | null;
  channel_type: 'course_qa' | 'tribe' | 'announcements';
  emoji: string;
  created_at: string;
}

export interface ForumPost {
  id: string;
  channel_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  body: string;
  is_answer: boolean;
  created_at: string;
}

export interface ForumPostWithReplies extends ForumPost {
  forum_replies: ForumReply[];
}

export interface CertificateTemplate {
  id: string;
  course_id: string;
  title_text: string;
  body_text: string;
  signatory_name: string;
  signatory_title: string;
  accent_color: string;
  created_at: string;
  courses?: Course;
}
