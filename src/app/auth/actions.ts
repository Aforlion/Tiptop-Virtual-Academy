'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ActionResult } from '@/lib/action-utils'

export async function login(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message };
  }

  const role = data.user?.user_metadata?.role || 'parent'
  
  let targetPath = '/parent/dashboard';
  if (role === 'admin') {
    targetPath = '/admin/dashboard';
  } else if (role === 'student') {
    targetPath = '/student/dashboard';
  }

  redirect(targetPath);
}

export async function signup(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const role = (formData.get('role') as string) || 'parent'

  if (!email || !password || !firstName || !lastName) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Security check: public signup cannot register as admin
  if (role === 'admin') {
    return { success: false, error: 'Administrator accounts cannot be registered publicly.' };
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message };
  }

  // Note: Profile auto-creation is handled by the database trigger!
  // The trigger reads the user metadata and populates the public.profiles table.

  let targetPath = '/parent/dashboard';
  if (role === 'student') {
    targetPath = '/student/dashboard';
  }

  redirect(targetPath);
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
