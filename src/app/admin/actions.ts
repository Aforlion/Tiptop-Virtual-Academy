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

