'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/lib/action-utils'
import { SupabaseClient } from '@supabase/supabase-js'

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
