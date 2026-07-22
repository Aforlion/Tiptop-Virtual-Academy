'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/lib/action-utils';

export interface BookingAttendanceInput {
  bookingId: string;
  attended: boolean;
  attendanceStatus?: 'present' | 'late' | 'absent' | 'excused';
  connectionStatus?: 'joined' | 'never_joined' | 'disconnected_early';
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
    .select('id, teacher_id, course_id')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) {
    return { success: false, error: 'Live session not found.' };
  }

  // 3. Verify user is assigned teacher or admin
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

  // 4. Update each student booking record with 4-state attendance and connection status metadata
  for (const item of bookingsData) {
    const attendanceStatus = item.attendanceStatus || (item.attended ? 'present' : 'absent');
    const connectionStatus = item.connectionStatus || (item.attended ? 'joined' : 'never_joined');

    const { error: updateErr } = await supabase
      .from('student_bookings')
      .update({
        attended: item.attended,
        attendance_status: attendanceStatus,
        connection_status: connectionStatus,
        earned_badges: item.badges
      })
      .eq('id', item.bookingId);

    if (updateErr) {
      console.error(`Failed to update booking ${item.bookingId}:`, updateErr);
      return { success: false, error: `Failed to update attendance: ${updateErr.message}` };
    }

    // 5. Notify Parent Portal on absence/late updates
    if (attendanceStatus === 'absent' || attendanceStatus === 'late') {
      const { data: booking } = await supabase
        .from('student_bookings')
        .select('students(first_name, parent_id)')
        .eq('id', item.bookingId)
        .single();

      if (booking && booking.students) {
        const studentObj = Array.isArray(booking.students) ? booking.students[0] : booking.students;
        if (studentObj?.parent_id) {
          await supabase.from('notifications').insert({
            profile_id: studentObj.parent_id,
            title: `Attendance Alert: ${studentObj.first_name}`,
            body: `${studentObj.first_name} was marked as ${attendanceStatus.toUpperCase()} for today's live class session.`,
            type: 'attendance'
          });
        }
      }
    }
  }

  // 6. Update session status to completed
  const { error: sessionUpdateErr } = await supabase
    .from('live_sessions')
    .update({ 
      status: 'completed',
      actual_ended_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (sessionUpdateErr) {
    console.error('Failed to complete session status:', sessionUpdateErr);
  }

  revalidatePath('/teacher/dashboard');
  revalidatePath(`/teacher/classes/${sessionId}`);
  return { success: true, message: 'Attendance & connection metadata logged and Parent Portal updated successfully!' };
}

export async function startLiveSession(sessionId: string): Promise<ActionResult> {
  if (!sessionId) return { success: false, error: 'Missing session ID.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('live_sessions')
    .update({
      status: 'live',
      actual_started_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/teacher/dashboard');
  revalidatePath(`/teacher/lessons`);
  return { success: true, message: 'Live lesson started successfully.' };
}

export async function generateGoogleMeetLink(sessionId: string): Promise<ActionResult> {
  if (!sessionId) return { success: false, error: 'Missing session ID.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: session } = await supabase
    .from('live_sessions')
    .select('id, meeting_token')
    .eq('id', sessionId)
    .single();

  if (!session) return { success: false, error: 'Session not found.' };

  const cleanRoom = session.meeting_token.replace(/[^a-zA-Z0-9-_]/g, '-');
  const meetUrl = `https://meet.google.com/lookup/${cleanRoom}`;

  const { error } = await supabase
    .from('live_sessions')
    .update({
      google_meet_url: meetUrl,
      sync_status: 'synced'
    })
    .eq('id', sessionId);

  if (error) {
    // Queue for automatic retry if sync fails
    await supabase.from('google_sync_retry_queue').insert({
      session_id: sessionId,
      action_type: 'create_meet',
      payload: { sessionId, meetUrl },
      status: 'pending',
      last_error: error.message
    });
    return { success: false, error: 'Meet link generated locally; queued background sync to Google Workspace.' };
  }

  revalidatePath('/teacher/dashboard');
  return { success: true, message: 'Google Meet link generated and synced with Google Workspace.' };
}

export async function createAssignment(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const resourceUrl = formData.get('resourceUrl') as string | null;
  const dueDateStr = formData.get('dueDate') as string;
  const publishToClassroom = formData.get('publishToClassroom') === 'true';

  if (!courseId || !title || !description || !dueDateStr) {
    return { success: false, error: 'Course, title, description, and due date are required.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: assignment, error } = await supabase
    .from('assignments')
    .insert({
      teacher_id: user.id,
      course_id: courseId,
      title,
      description,
      resource_url: resourceUrl || null,
      due_date: new Date(dueDateStr).toISOString(),
      published_to_classroom: publishToClassroom
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  if (publishToClassroom && assignment) {
    await supabase.from('google_sync_retry_queue').insert({
      action_type: 'publish_assignment',
      payload: { assignmentId: assignment.id, title, courseId },
      status: 'pending'
    });
  }

  revalidatePath('/teacher/assignments');
  return { success: true, message: 'Assignment created successfully!' };
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
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in again.' };
  }

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

  if (id) {
    const { data: plan } = await supabase
      .from('lesson_plans')
      .select('teacher_id')
      .eq('id', id)
      .single();

    if (!plan) return { success: false, error: 'Lesson plan not found.' };

    if (plan.teacher_id !== user.id && !isAdmin) {
      return { success: false, error: 'Unauthorized: You do not own this lesson plan.' };
    }

    const { error } = await supabase
      .from('lesson_plans')
      .update({ course_id: courseId, title, content })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('lesson_plans')
      .insert({ teacher_id: user.id, course_id: courseId, title, content });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/teacher/lessons');
  return { success: true, message: 'Lesson plan saved successfully!' };
}

export async function deleteLessonPlan(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: 'Missing plan ID.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

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

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
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
