import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Fire welcome email (best-effort, non-blocking)
      fetch(`${origin}/api/auth/welcome`, {
        method: 'POST',
        headers: { cookie: request.headers.get('cookie') || '' }
      }).catch(() => {});

      // Check if user has a saved home → returning user goes to dashboard
      // New user (no home) goes to onboarding
      const { data: { user } } = await supabase.auth.getUser()
      let redirectPath = next

      if (user && next === '/') {
        const { data: homes } = await supabase
          .from('saved_homes')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        redirectPath = (homes && homes.length > 0) ? '/dashboard' : '/onboarding'
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
