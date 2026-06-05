import { createClient } from './supabase/server';
import { PostgrestError } from '@supabase/supabase-js';
import { 
  Profile, 
  Student, 
  Course, 
  LiveSessionWithCourse, 
  BookingWithDetails,
  CohortEnrollmentWithCourse,
  LeaderboardEntry
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

/**
 * Fetches all challenges and returns them mapped with the student's progress.
 */
export async function getStudentChallenges(
  studentId: string
): Promise<{ data: any[] | null; error: any }> {
  const supabase = await createClient();

  // 1. Fetch all challenges
  const { data: challenges, error: challErr } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: true });

  if (challErr) return { data: null, error: challErr };

  // 2. Fetch student progress
  const { data: progress, error: progErr } = await supabase
    .from('student_challenges')
    .select('*')
    .eq('student_id', studentId);

  if (progErr) return { data: null, error: progErr };

  const progressMap = new Map(progress?.map(p => [p.challenge_id, p]) || []);

  // 3. Merge challenges with progress
  const merged = (challenges || []).map(c => {
    const prog = progressMap.get(c.id);
    return {
      ...c,
      progress_count: prog?.progress_count || 0,
      completed: prog?.completed || false,
      completed_at: prog?.completed_at || null,
    };
  });

  return { data: merged, error: null };
}

/**
 * Calculates global and weekly leaderboards for all students.
 */
export async function getLeaderboards(
  studentId: string
): Promise<{ 
  allTime: LeaderboardEntry[]; 
  weekly: LeaderboardEntry[]; 
  error: any 
}> {
  const supabase = await createClient();

  // 1. Fetch all students
  const { data: students, error: studErr } = await supabase
    .from('students')
    .select('id, first_name, xp');

  if (studErr) return { allTime: [], weekly: [], error: studErr };

  // 2. Fetch recent transactions (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: txs, error: txErr } = await supabase
    .from('student_xp_transactions')
    .select('student_id, amount')
    .gte('created_at', oneWeekAgo.toISOString());

  if (txErr) return { allTime: [], weekly: [], error: txErr };

  // 3. Sum weekly XP per student
  const weeklyXpMap: Record<string, number> = {};
  txs?.forEach(tx => {
    weeklyXpMap[tx.student_id] = (weeklyXpMap[tx.student_id] || 0) + tx.amount;
  });

  const getLeagueTier = (xp: number) => {
    if (xp >= 7500) return 'Diamond';
    if (xp >= 3500) return 'Platinum';
    if (xp >= 1500) return 'Gold';
    if (xp >= 500) return 'Silver';
    return 'Bronze';
  };

  const allStudentsList = (students || []).map(s => {
    const totalXp = s.xp || 0;
    const weeklyXp = weeklyXpMap[s.id] || 0;
    return {
      student_id: s.id,
      first_name: s.first_name,
      total_xp: totalXp,
      weekly_xp: weeklyXp,
      league_tier: getLeagueTier(totalXp) as any,
      is_current_student: s.id === studentId,
    };
  });

  // Sort and rank All-Time
  const allTime = [...allStudentsList]
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  // Sort and rank Weekly
  const weekly = [...allStudentsList]
    .sort((a, b) => b.weekly_xp - a.weekly_xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return { allTime, weekly, error: null };
}

/**
 * Returns streak stats for a student (current streak, and last 7 days checklist).
 */
export async function getStudentStreaks(
  studentId: string
): Promise<{
  currentStreak: number;
  lastSevenDays: { dayName: string; active: boolean; dateString: string }[];
  error: any;
}> {
  const supabase = await createClient();

  // Fetch XP transactions for this student from the last 14 days to calculate streak
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: txs, error } = await supabase
    .from('student_xp_transactions')
    .select('created_at')
    .eq('student_id', studentId)
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return { currentStreak: 0, lastSevenDays: [], error };
  }

  // Map transactions to date strings (YYYY-MM-DD) in local time
  const activeDatesSet = new Set(
    txs?.map(tx => new Date(tx.created_at).toISOString().split('T')[0]) || []
  );

  // 1. Generate last 7 days checklist (today, yesterday, etc.)
  const lastSevenDays = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    lastSevenDays.push({
      dayName,
      dateString,
      active: activeDatesSet.has(dateString),
    });
  }

  // 2. Calculate consecutive streak counting backwards from today or yesterday
  let currentStreak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate = new Date();
  
  // If no activity today, check starting from yesterday
  if (!activeDatesSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (activeDatesSet.has(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    // Safety break
    if (currentStreak > 100) break;
  }

  return { currentStreak, lastSevenDays, error: null };
}
