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

  // Verify the session cryptographically — getUser() validates the JWT with
  // Supabase Auth servers, unlike getSession() which only reads the local cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Protected paths helper
  const isDashboardPath =
    path.startsWith('/admin') ||
    path.startsWith('/parent') ||
    path.startsWith('/student') ||
    path.startsWith('/teacher')

  if (!user) {
    // Unauthenticated → redirect to login for protected paths
    if (isDashboardPath) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── Security: read role from app_metadata (set server-side by Supabase Auth
  // trigger / admin SDK) rather than user_metadata (client-modifiable).
  // app_metadata is signed into the JWT and cannot be changed by the user.
  // Falls back to 'parent' if not set.
  const role: string = (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || 'parent'

  // If user is logged in and on auth/root pages, redirect to their dashboard
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

  // Role-specific directory enforcement — wrong-role access gets redirected
  // to their own dashboard, NOT to a 403, to avoid leaking route existence.
  const roleDashboard: Record<string, string> = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
  }
  const myDashboard = roleDashboard[role] ?? '/parent/dashboard'

  if (path.startsWith('/admin') && role !== 'admin') {
    url.pathname = myDashboard
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/student') && role !== 'student') {
    url.pathname = myDashboard
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/parent') && role !== 'parent') {
    url.pathname = myDashboard
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/teacher') && role !== 'teacher') {
    url.pathname = myDashboard
    return NextResponse.redirect(url)
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
     * - auth/callback (Supabase auth flow endpoint)
     * - Static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
