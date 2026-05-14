import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  const isPublicPath = 
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/post/') ||
    pathname.startsWith('/api/posts') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/uploadthing') ||
    pathname.startsWith('/api/whitelist') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  if (isPublicPath) {
    return
  }

  if (!req.auth) {
    const signInUrl = new URL('/login', req.url)
    signInUrl.searchParams.set('callbackUrl', req.url)
    return Response.redirect(signInUrl)
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
