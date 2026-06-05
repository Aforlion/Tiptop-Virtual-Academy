'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/lib/action-utils';

export interface BookingAttendanceInput {
  bookingId: string;
  attended: boolean;
  badges: string[];
}

export async function submitAttendanceAndBadges(
  sessionId: string,
  bookingsData: BookingAttendanceInput[]
): Promise<ActionResult> {
  if (!sessionId || !bookingsData || bookingsData.length === 0) {
    return { success: false, error: 'Missing session ID or attendance data.' };
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in again.' };
  }

  // 2. Fetch session details to verify authorization
  const { data: session, error: sessionErr } = await supabase
    .from('live_sessions')
    .select('id, teacher_id')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) {
    return { success: false, error: 'Live session not found.' };
  }

  // 3. Verify user is the assigned teacher or an admin
  const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', user.id)
     .single();
  const isAdmin = profile?.role === 'admin';
  const isAssignedTeacher = session.teacher_id === user.id;

  if (!isAssignedTeacher && !isAdmin) {
    return { success: false, error: 'Unauthorized: You are not authorized to log attendance for this class.' };
  }

  // 4. Update each student booking record
  for (const item of bookingsData) {
    const { error: updateErr } = await supabase
      .from('student_bookings')
      .update({
        attended: item.attended,
        earned_badges: item.badges
      })
      .eq('id', item.bookingId);

    if (updateErr) {
      console.error(`Failed to update booking ${item.bookingId}:`, updateErr);
      return { success: false, error: `Failed to update attendance: ${updateErr.message}` };
    }
  }

  // 5. Update session status to completed
  const { error: sessionUpdateErr } = await supabase
    .from('live_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId);

  if (sessionUpdateErr) {
    console.error('Failed to complete session status:', sessionUpdateErr);
  }

  revalidatePath('/teacher/dashboard');
  revalidatePath(`/teacher/classes/${sessionId}`);
  return { success: true, message: 'Attendance and rewards logged successfully!' };
}

export async function upsertLessonPlan(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get('id') as string | null;
  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!courseId || !title || !content) {
    return { success: false, error: 'Course, title, and lesson content are required.' };
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in again.' };
  }

  // 2. Fetch role
  const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', user.id)
     .single();
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';

  if (!isTeacher && !isAdmin) {
    return { success: false, error: 'Unauthorized: Only teachers and admins can manage lesson plans.' };
  }

  // 3. Upsert lesson plan
  if (id) {
    // Check ownership before update
    const { data: plan } = await supabase
      .from('lesson_plans')
      .select('teacher_id')
      .eq('id', id)
      .single();

    if (!plan) {
      return { success: false, error: 'Lesson plan not found.' };
    }

    if (plan.teacher_id !== user.id && !isAdmin) {
      return { success: false, error: 'Unauthorized: You do not own this lesson plan.' };
    }

    const { error } = await supabase
      .from('lesson_plans')
      .update({
        course_id: courseId,
        title,
        content
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('lesson_plans')
      .insert({
        teacher_id: user.id,
        course_id: courseId,
        title,
        content
      });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/teacher/lessons');
  return { success: true, message: 'Lesson plan saved successfully!' };
}

export async function deleteLessonPlan(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: 'Missing plan ID.' };

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Check ownership
  const { data: plan } = await supabase
    .from('lesson_plans')
    .select('teacher_id')
    .eq('id', id)
    .single();

  if (!plan) return { success: false, error: 'Plan not found.' };

  const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', user.id)
     .single();
  const isAdmin = profile?.role === 'admin';

  if (plan.teacher_id !== user.id && !isAdmin) {
    return { success: false, error: 'Unauthorized to delete this lesson plan.' };
  }

  const { error } = await supabase
    .from('lesson_plans')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/teacher/lessons');
  return { success: true };
}

// ============================================================
// AVAILABILITY — save a teacher's weekly availability slots
// ============================================================

export interface AvailabilitySlot {
  day_of_week: number; // 0-6
  start_time: string;  // 'HH:MM'
  end_time: string;    // 'HH:MM'
}

export async function saveAvailability(
  slots: AvailabilitySlot[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only teachers can set availability.' };
  }

  // Delete all existing slots for this teacher and replace with the new set
  const { error: deleteErr } = await supabase
    .from('teacher_availability')
    .delete()
    .eq('teacher_id', user.id);

  if (deleteErr) return { success: false, error: deleteErr.message };

  if (slots.length === 0) {
    revalidatePath('/teacher/availability');
    return { success: true, message: 'Availability cleared.' };
  }

  const rows = slots.map(s => ({
    teacher_id: user.id,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
  }));

  const { error: insertErr } = await supabase
    .from('teacher_availability')
    .insert(rows);

  if (insertErr) return { success: false, error: insertErr.message };

  revalidatePath('/teacher/availability');
  return { success: true, message: 'Availability saved successfully!' };
}

// ============================================================
// COHORT ROSTER — enrol / remove students
// ============================================================

export async function enrollStudentInCohort(
  studentId: string,
  courseId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('cohort_enrollments')
    .insert({ student_id: studentId, course_id: courseId });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Student is already enrolled.' };
    return { success: false, error: error.message };
  }

  revalidatePath('/teacher/cohorts');
  return { success: true, message: 'Student enrolled successfully.' };
}

export async function removeStudentFromCohort(
  enrollmentId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('cohort_enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/teacher/cohorts');
  return { success: true, message: 'Student removed from cohort.' };
}

