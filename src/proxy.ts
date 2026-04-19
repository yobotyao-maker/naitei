import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isDesignRoute = pathname.startsWith('/design')
  const isInterviewRoute = pathname.startsWith('/interview')
  const isProtectedRoute = isAdminRoute || isDesignRoute || isInterviewRoute

  if (!isProtectedRoute) return NextResponse.next()

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = new URL('/auth', req.url)
    if (isDesignRoute || isInterviewRoute) {
      url.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(url)
  }

  // Admin-specific checks
  if (isAdminRoute) {
    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRow) return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/design/:path*', '/interview/:path*'],
}
