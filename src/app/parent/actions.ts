'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/lib/action-utils'
import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/BookingConfirmation'
export async function addChild(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const firstName = formData.get('firstName') as string
  const dob = formData.get('dob') as string
  const notes = formData.get('notes') as string

  if (!firstName || !dob) {
    return { success: false, error: 'First name and date of birth are required.' }
  }

  const supabase = await createClient()

  // Get logged in parent
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in again.' }
  }

  const { error } = await supabase
    .from('students')
    .insert({
      parent_id: user.id,
      first_name: firstName,
      date_of_birth: dob,
      notes: notes || null
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/parent/dashboard')
  return { success: true, message: 'Student profile registered successfully!' }
}

export async function bookSession(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const studentId = formData.get('studentId') as string
  const sessionId = formData.get('sessionId') as string

  if (!studentId || !sessionId) {
    return { success: false, error: 'Student and session selection are required.' }
  }

  const supabase = await createClient()

  // Get logged in parent
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) {
    return { success: false, error: 'Unauthorized: Please log in again.' }
  }

  // Atomically: check credit >= 1, deduct 1, insert booking using stored RPC function (Rule 1: Credit Guard)
  const { error } = await supabase.rpc('book_flexible_session', {
    p_student_id: studentId,
    p_session_id: sessionId,
    p_parent_id: user.id
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Attempt to send email notification
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const { data: sessionData } = await supabase
        .from('live_sessions')
        .select('*, courses(*)')
        .eq('id', sessionId)
        .single();
          
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      const parentName = user.user_metadata?.first_name || 'Parent';

      if (sessionData && studentData) {
        // Send to sandbox email if defined, otherwise attempt to use user email
        const toEmail = process.env.RESEND_SANDBOX_EMAIL || user.email || 'delivered@resend.dev';
        
        await resend.emails.send({
          from: 'Tiptop Academy <onboarding@resend.dev>',
          to: toEmail,
          subject: `Class Booking Confirmed: ${sessionData.courses?.title}`,
          react: BookingConfirmationEmail({
            parentName,
            studentName: studentData.first_name,
            courseName: sessionData.courses?.title || 'Live Class',
            teacherName: sessionData.teacher_name,
            startTime: sessionData.scheduled_start,
            durationMinutes: 60
          })
        });
      }
    }
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // We don't fail the booking if the email fails
  }

  revalidatePath('/parent/dashboard')
  return { success: true, message: 'Class seat booked successfully!' }
}

export async function deleteBooking(bookingId: string, parentId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify logged in user matches parentId
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== parentId) {
    return { success: false, error: 'Unauthorized cancellation attempt.' }
  }

  // Cancel booking and refund credit if flexible (handled atomically in SQL)
  const { error } = await supabase.rpc('cancel_flexible_booking', {
    p_booking_id: bookingId,
    p_parent_id: parentId
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/parent/dashboard')
  return { success: true }
}
