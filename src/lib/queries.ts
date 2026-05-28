import { createClient } from './supabase/server';
import { PostgrestError } from '@supabase/supabase-js';
import { 
  Profile, 
  Student, 
  Course, 
  LiveSessionWithCourse, 
  BookingWithDetails,
  CohortEnrollmentWithCourse
} from './types';

/**
 * Fetches the user profile by ID.
 */
export async function getProfile(userId: string): Promise<{ data: Profile | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as Profile | null, error };
}

/**
 * Fetches all student records linked to a parent user ID.
 */
export async function getStudentsByParent(parentId: string): Promise<{ data: Student[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', parentId)
    .order('first_name', { ascending: true });
  return { data: data as Student[] | null, error };
}

/**
 * Fetches a single student record by ID.
 */
export async function getStudentById(studentId: string): Promise<{ data: Student | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();
  return { data: data as Student | null, error };
}

/**
 * Fetches all courses.
 */
export async function getAllCourses(): Promise<{ data: Course[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('title', { ascending: true });
  return { data: data as Course[] | null, error };
}

/**
 * Fetches all scheduled live sessions.
 */
export async function getAllLiveSessions(): Promise<{ data: LiveSessionWithCourse[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*, courses(*)')
    .order('scheduled_start', { ascending: true });
  return { data: data as LiveSessionWithCourse[] | null, error };
}

/**
 * Fetches upcoming live sessions (starting from now onwards).
 */
export async function getUpcomingSessions(): Promise<{ data: LiveSessionWithCourse[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*, courses(*)')
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true });
  return { data: data as LiveSessionWithCourse[] | null, error };
}

/**
 * Fetches bookings for all students of a parent.
 */
export async function getBookingsByParent(parentId: string): Promise<{ data: BookingWithDetails[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  
  // 1. Get student IDs for this parent
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('parent_id', parentId);
    
  if (!students || students.length === 0) {
    return { data: [], error: null };
  }
  
  const studentIds = students.map(s => s.id);
  
  // 2. Fetch bookings for these students
  const { data, error } = await supabase
    .from('student_bookings')
    .select('*, students(*), live_sessions(*, courses(*))')
    .in('student_id', studentIds)
    .order('created_at', { ascending: false });
    
  return { data: data as BookingWithDetails[] | null, error };
}

/**
 * Fetches bookings for a specific student ID.
 */
export async function getBookingsByStudent(studentId: string): Promise<{ data: BookingWithDetails[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_bookings')
    .select('*, students(*), live_sessions(*, courses(*))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return { data: data as BookingWithDetails[] | null, error };
}

/**
 * Fetches cohort enrollments for a specific student ID.
 */
export async function getCohortEnrollmentsByStudent(studentId: string): Promise<{ data: CohortEnrollmentWithCourse[] | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cohort_enrollments')
    .select('*, courses(*)')
    .eq('student_id', studentId);
  return { data: data as CohortEnrollmentWithCourse[] | null, error };
}
