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
