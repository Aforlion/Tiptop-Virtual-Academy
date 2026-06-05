'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/lib/action-utils'
import { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import TeacherWelcomeEmail from '@/emails/TeacherWelcome'

// Helper to check if the current user is an authorized Admin
async function checkAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return false
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile || profile.role !== 'admin') {
    return false
  }

  return true
}

export async function createCourse(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const minAge = parseInt(formData.get('minAge') as string)
  const maxAge = parseInt(formData.get('maxAge') as string)

  if (!title || isNaN(minAge) || isNaN(maxAge)) {
    return { success: false, error: 'Title and ages are required.' }
  }

  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return { success: false, error: 'Forbidden: Administrator privileges required.' }
  }

  const { error } = await supabase
    .from('courses')
    .insert({
      title,
      description: description || null,
      min_age: minAge,
      max_age: maxAge
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: true, message: 'Curriculum course created successfully!' }
}

export async function createLiveSession(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const courseId = formData.get('courseId') as string
  const teacherName = formData.get('teacherName') as string
  const meetingToken = formData.get('meetingToken') as string || `room-${Math.random().toString(36).substring(2, 7)}`
  const scheduledStart = formData.get('scheduledStart') as string
  const scheduledEnd = formData.get('scheduledEnd') as string
  const sessionType = formData.get('sessionType') as 'cohort' | 'flexible'

  if (!courseId || !teacherName || !scheduledStart || !scheduledEnd || !sessionType) {
    return { success: false, error: 'All fields are required.' }
  }

  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return { success: false, error: 'Forbidden: Administrator privileges required.' }
  }

  const { error } = await supabase
    .from('live_sessions')
    .insert({
      course_id: courseId,
      teacher_name: teacherName,
      meeting_token: meetingToken,
      scheduled_start: new Date(scheduledStart).toISOString(),
      scheduled_end: new Date(scheduledEnd).toISOString(),
      session_type: sessionType
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: true, message: 'Live session scheduled successfully!' }
}

export async function deleteLiveSession(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  
  if (!(await checkAdmin(supabase))) {
    return { success: false, error: 'Forbidden: Administrator privileges required.' }
  }

  const { error } = await supabase
    .from('live_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  
  if (!(await checkAdmin(supabase))) {
    return { success: false, error: 'Forbidden: Administrator privileges required.' }
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function createTeacherAccountAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;

  if (!firstName || !lastName || !email) {
    return { success: false, error: 'First name, last name, and email are required.' };
  }

  // 1. Authenticate that the actor is indeed an admin
  const userClient = await createClient();
  const { data: { user: actor }, error: actorErr } = await userClient.auth.getUser();
  if (actorErr || !actor) {
    return { success: false, error: 'Unauthorized: Please log in again.' };
  }

  const { data: profile } = await userClient
    .from('profiles')
    .select('role')
    .eq('id', actor.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only administrators can create teacher accounts.' };
  }

  // 2. Generate a secure temporary password
  const tempPassword = 'Temp-' + Math.random().toString(36).slice(-8) + '!' + Math.floor(Math.random() * 10);

  const supabaseAdmin = createAdminClient();

  // 3. Create the user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role: 'teacher',
      phone_number: phoneNumber || null
    }
  });

  if (authError || !authData.user) {
    console.error('Failed to create auth user:', authError);
    return { success: false, error: authError?.message || 'Failed to create user account.' };
  }

  // 4. Force update profile to ensure role is teacher (the database trigger handle_new_user should do this, but this is a fail-safe)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      role: 'teacher',
      phone_number: phoneNumber || null
    })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error('Failed to update teacher profile role:', profileError);
  }

  // 5. Send Welcome Email via Resend
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const toEmail = process.env.RESEND_SANDBOX_EMAIL || email;
      const teacherName = `${firstName} ${lastName}`;

      await resend.emails.send({
        from: 'Tiptop Academy <onboarding@resend.dev>',
        to: toEmail,
        subject: 'Welcome to Tiptop Academy — Your Teacher Account Credentials',
        react: TeacherWelcomeEmail({
          teacherName,
          email,
          temporaryPassword: tempPassword,
        })
      });
      
      console.log(`Welcome email successfully sent to ${toEmail} (for ${email})`);
    } else {
      console.warn('RESEND_API_KEY is not defined. Welcome email skipped.');
    }
  } catch (emailError) {
    console.error('Failed to send welcome email to teacher:', emailError);
    return { 
      success: true, 
      message: `Account created successfully, but welcome email failed to send. Temp Password: ${tempPassword}`
    };
  }

  revalidatePath('/admin/users');
  return { 
    success: true, 
    message: 'Teacher account created successfully and welcome email sent!' 
  };
}

// ============================================================
// CERTIFICATE TEMPLATES — admin-managed per-course certificates
// ============================================================

export async function saveCertificateTemplate(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const courseId      = formData.get('courseId') as string;
  const titleText     = formData.get('titleText') as string;
  const bodyText      = formData.get('bodyText') as string;
  const signatoryName = formData.get('signatoryName') as string;
  const signatoryTitle= formData.get('signatoryTitle') as string;
  const accentColor   = formData.get('accentColor') as string;

  if (!courseId || !titleText || !bodyText || !signatoryName) {
    return { success: false, error: 'All fields are required.' };
  }

  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) {
    return { success: false, error: 'Forbidden: Administrator privileges required.' };
  }

  const { error } = await supabase
    .from('certificate_templates')
    .upsert({
      course_id:       courseId,
      title_text:      titleText,
      body_text:       bodyText,
      signatory_name:  signatoryName,
      signatory_title: signatoryTitle,
      accent_color:    accentColor || '#7c3aed',
    }, { onConflict: 'course_id' });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/certificates');
  return { success: true, message: 'Certificate template saved!' };
}

// ============================================================
// FORUM POSTS
// ============================================================

export async function createForumPost(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const channelId = formData.get('channelId') as string;
  const title     = formData.get('title') as string;
  const body      = formData.get('body') as string;

  if (!channelId || !title?.trim() || !body?.trim()) {
    return { success: false, error: 'Channel, title, and body are required.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { success: false, error: 'Profile not found.' };

  const authorName = `${profile.first_name} ${profile.last_name}`;

  const { error } = await supabase.from('forum_posts').insert({
    channel_id:  channelId,
    author_id:   user.id,
    author_name: authorName,
    author_role: profile.role,
    title:       title.trim(),
    body:        body.trim(),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/community/${channelId}`);
  revalidatePath('/community');
  revalidatePath('/admin/community');
  return { success: true, message: 'Post created!' };
}

export async function createForumReply(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const postId    = formData.get('postId') as string;
  const channelId = formData.get('channelId') as string;
  const body      = formData.get('body') as string;

  if (!postId || !body?.trim()) {
    return { success: false, error: 'Reply body is required.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { success: false, error: 'Profile not found.' };

  const { error } = await supabase.from('forum_replies').insert({
    post_id:     postId,
    author_id:   user.id,
    author_name: `${profile.first_name} ${profile.last_name}`,
    author_role: profile.role,
    body:        body.trim(),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/community/${channelId}`);
  revalidatePath(`/admin/community`);
  return { success: true, message: 'Reply posted!' };
}

// ============================================================
// CHAT MESSAGES — real-time classroom chat
// ============================================================

export async function sendChatMessage(
  sessionId: string,
  body: string
): Promise<ActionResult> {
  if (!sessionId || !body?.trim()) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { success: false, error: 'Profile not found.' };

  const { error } = await supabase.from('chat_messages').insert({
    session_id:  sessionId,
    sender_id:   user.id,
    sender_name: `${profile.first_name} ${profile.last_name}`,
    sender_role: profile.role,
    body:        body.trim(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// ASSESSMENT & QUIZ ENGINE SUBMISSIONS
// ============================================================

export async function submitAssessmentResponse(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const rawStudentId  = formData.get('studentId') as string;
  const assessmentId  = formData.get('assessmentId') as string;
  const timeSpentSecs = parseInt(formData.get('timeSpentSecs') as string || '0', 10);
  const responsesJson = formData.get('responses') as string;

  if (!rawStudentId || !assessmentId || !responsesJson) {
    return { success: false, error: 'Student, assessment, and responses are required.' };
  }

  // Validate UUID format to prevent injection / enumeration attacks
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(rawStudentId) || !uuidRegex.test(assessmentId)) {
    return { success: false, error: 'Invalid submission parameters.' };
  }

  const supabase = await createClient();

  // ── CVE-1 FIX: Verify caller identity and student ownership ──────────────
  // Never trust the studentId from the form; the parent must own the student.
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in.' };
  }

  // Check role — teachers and admins can submit on behalf of any student
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isPrivileged = callerProfile?.role === 'admin' || callerProfile?.role === 'teacher';

  if (!isPrivileged) {
    // For parents: verify the student belongs to them
    const { data: ownedStudent, error: ownershipErr } = await supabase
      .from('students')
      .select('id')
      .eq('id', rawStudentId)
      .eq('parent_id', user.id)
      .single();

    if (ownershipErr || !ownedStudent) {
      return {
        success: false,
        error: 'Forbidden: You do not have permission to submit for this student.',
      };
    }
  }
  // ── End ownership check ──────────────────────────────────────────────────

  const studentId = rawStudentId; // Now verified to be safe

  // 1. Fetch questions to grade
  const { data: questions, error: qErr } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (qErr || !questions) {
    return { success: false, error: 'Failed to fetch assessment questions for grading.' };
  }

  const userAnswers = JSON.parse(responsesJson);
  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  const responseLogs: any[] = [];

  questions.forEach((q: any) => {
    const userAnswer = userAnswers[q.id];
    const correctAnswer = q.correct_answer;
    maxScore += q.points;

    let isCorrect = false;
    let isSkipped = userAnswer === undefined || userAnswer === null || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0);

    if (isSkipped) {
      skippedCount++;
    } else {
      if (q.question_type === 'mcq_single' || q.question_type === 'reading') {
        isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
      } else if (q.question_type === 'fill_in') {
        isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
      } else if (q.question_type === 'mcq_multiple') {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const sortedUser = [...userAnswer].map(s => String(s).trim().toLowerCase()).sort();
          const sortedCorrect = [...correctAnswer].map(s => String(s).trim().toLowerCase()).sort();
          isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
        }
      }

      if (isCorrect) {
        correctCount++;
        totalScore += q.points;
      } else {
        incorrectCount++;
      }
    }

    responseLogs.push({
      question_id: q.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_secs: 0, // simple mock tracking per question
    });
  });

  const percentage = maxScore > 0 ? parseFloat(((totalScore / maxScore) * 100).toFixed(2)) : 0;

  // 2. Insert submission
  const { data: submission, error: subErr } = await supabase
    .from('assessment_submissions')
    .insert({
      student_id: studentId,
      assessment_id: assessmentId,
      score: totalScore,
      percentage: percentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      time_spent_secs: timeSpentSecs,
      responses: responseLogs,
    })
    .select()
    .single();

  if (subErr || !submission) {
    return { success: false, error: subErr?.message || 'Failed to record assessment submission.' };
  }

  // 3. Award Gamification XP points (Phase 3 integration)
  // 10 XP per correct question
  const xpEarned = correctCount * 10;
  if (xpEarned > 0) {
    await supabase.from('student_xp_transactions').insert({
      student_id: studentId,
      amount: xpEarned,
      reason: 'streak_bonus',
      reference_id: submission.id,
    });
  }

  // Extra 50 XP perfect score bonus
  if (percentage === 100) {
    await supabase.from('student_xp_transactions').insert({
      student_id: studentId,
      amount: 50,
      reason: 'challenge_completed',
      reference_id: submission.id,
    });
  }

  revalidatePath('/parent/reports');
  revalidatePath('/student/dashboard');

  return {
    success: true,
    message: `Assessment submitted! You got ${correctCount} correct. Earned ${xpEarned + (percentage === 100 ? 50 : 0)} XP!`,
  };
}



