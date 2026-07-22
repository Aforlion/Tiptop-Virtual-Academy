'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/lib/action-utils';

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  submissionUrl: string,
  notes?: string
): Promise<ActionResult> {
  if (!assignmentId || !studentId) {
    return { success: false, error: 'Missing assignment or student identifier.' };
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in again.' };
  }

  // 2. Verify student ownership (either user is parent of student, or student profile)
  const { data: student } = await supabase
    .from('students')
    .select('id, parent_id, first_name')
    .eq('id', studentId)
    .single();

  if (!student) {
    return { success: false, error: 'Student profile not found.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isParent = student.parent_id === user.id;
  const isAdmin = profile?.role === 'admin';

  if (!isParent && !isAdmin) {
    return { success: false, error: 'Unauthorized: You are not authorized to submit assignments for this student.' };
  }

  // 3. Upsert assignment submission
  const { error: upsertErr } = await supabase
    .from('assignment_submissions')
    .upsert({
      assignment_id: assignmentId,
      student_id: studentId,
      submission_url: submissionUrl || null,
      notes: notes || null,
      submitted_at: new Date().toISOString()
    }, {
      onConflict: 'assignment_id,student_id'
    });

  if (upsertErr) {
    console.error('Failed to submit assignment:', upsertErr);
    return { success: false, error: `Submission failed: ${upsertErr.message}` };
  }

  // 4. Award XP for completing homework assignment
  await supabase.from('student_xp_transactions').insert({
    student_id: studentId,
    amount: 75,
    reason: 'homework_completed',
    reference_id: assignmentId
  });

  revalidatePath('/student/dashboard/assignments');
  revalidatePath('/student/progress');
  return { success: true, message: 'Homework submitted successfully! +75 XP awarded.' };
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  if (!notificationId) return { success: false, error: 'Missing notification ID.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/student/notifications');
  return { success: true };
}
