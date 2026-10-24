import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth?: unknown }) => {
  const isAuthenticated = !!(req as { auth?: unknown }).auth
  const { pathname } = req.nextUrl

  const protectedPaths = ['/account', '/checkout']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !isAuthenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
