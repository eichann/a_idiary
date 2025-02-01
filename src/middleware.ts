import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッション取得のデバッグログ
  console.log('Middleware - Request path:', req.nextUrl.pathname)
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  // セッション状態のデバッグログ
  console.log('Middleware - Session:', !!session)
  console.log('Middleware - Session error:', error)
  if (session) {
    console.log('Middleware - User:', session.user.email)
  }

  // 未認証ユーザーをログインページにリダイレクト
  if (!session && req.nextUrl.pathname !== '/login' && req.nextUrl.pathname !== '/signup') {
    const redirectUrl = new URL('/login', req.url)
    console.log('Middleware - Redirecting to login:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // 認証済みユーザーがログインページにアクセスした場合、ダッシュボードにリダイレクト
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    const redirectUrl = new URL('/', req.url)
    console.log('Middleware - Redirecting to dashboard:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// middlewareを適用するパスを指定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 
