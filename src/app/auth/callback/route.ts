import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      const role = user.user_metadata?.role || 'parent'
      
      let redirectUrl = '/parent/dashboard'
      if (role === 'admin') {
        redirectUrl = '/admin/dashboard'
      } else if (role === 'student') {
        redirectUrl = '/student/dashboard'
      }

      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // Return the user to login with an error message
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
