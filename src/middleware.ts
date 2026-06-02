import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Dynamic role-based route protection
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Protected paths helper
  const isDashboardPath = path.startsWith('/admin') || path.startsWith('/parent') || path.startsWith('/student') || path.startsWith('/teacher')

  if (!user) {
    // If not logged in and trying to access protected dashboards, redirect to login
    if (isDashboardPath) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } else {
    // Get user metadata for role redirection
    const role = user.user_metadata?.role || 'parent' // default role is parent
    
    // If user is logged in and trying to access auth pages or landing root, redirect to respective dashboard
    if (path === '/' || path === '/login' || path === '/signup') {
      if (role === 'admin') {
        url.pathname = '/admin/dashboard'
      } else if (role === 'teacher') {
        url.pathname = '/teacher/dashboard'
      } else if (role === 'student') {
        url.pathname = '/student/dashboard'
      } else {
        url.pathname = '/parent/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Role-specific directory enforcement
    if (path.startsWith('/admin') && role !== 'admin') {
      url.pathname = role === 'teacher' ? '/teacher/dashboard' : (role === 'student' ? '/student/dashboard' : '/parent/dashboard')
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/student') && role !== 'student') {
      url.pathname = role === 'admin' ? '/admin/dashboard' : (role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard')
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/parent') && role !== 'parent') {
      url.pathname = role === 'admin' ? '/admin/dashboard' : (role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/teacher') && role !== 'teacher') {
      url.pathname = role === 'admin' ? '/admin/dashboard' : (role === 'student' ? '/student/dashboard' : '/parent/dashboard')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth flow endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
