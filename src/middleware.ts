import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/select-role',
  '/join-organization',
  '/organization-joined',
  '/api(.*)'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url)
  const roleSetCookie = request.cookies.get('role-just-set')

  // Allow public routes and API routes
  if (isPublicRoute(request)) {
    // Still protect API routes but don't redirect
    if (request.url.includes('/api/')) {
      await auth.protect()
    }
    return NextResponse.next()
  }

 // Bypass ALL role logic temporarily after role is set
if (url.searchParams.has('role-set') || roleSetCookie) {
  console.log('⚠️ BYPASSING ALL CHECKS — role was just set')

  // Still require login
  await auth.protect()

  const res = NextResponse.next()

  // If role-set param is present and cookie wasn't set yet → set bypass cookie
  // Cookie lasts 10 minutes to prevent timeout during active use
  if (url.searchParams.has('role-set') && !roleSetCookie) {
    res.cookies.set('role-just-set', 'true', {
      maxAge: 600, // 10 minutes instead of 30 seconds
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    })
    console.log('✅ Cookie set — bypass active for 10 minutes')
  }

  // 🔥 CRITICAL: Immediately exit and SKIP ALL ADMIN CHECKS
  return res
}


  // Protect all other routes
  const { userId, sessionClaims } = await auth.protect()

  // Check if user has selected a role
  const role = (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role

  // If no role, redirect to role selection
  if (!role && !request.url.includes('/select-role')) {
    console.log('No role found, redirecting to select-role')
    return NextResponse.redirect(new URL('/select-role', request.url))
  }

  // Protect admin routes - only redirect if role is explicitly NOT admin
  if (isAdminRoute(request)) {
    if (role !== 'admin') {
      console.log('Non-admin trying to access admin route, redirecting to chat')
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}