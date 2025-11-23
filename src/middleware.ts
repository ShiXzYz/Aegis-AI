import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/select-role',
  '/api(.*)'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes and API routes
  if (isPublicRoute(request)) {
    // Still protect API routes but don't redirect
    if (request.url.includes('/api/')) {
      await auth.protect()
    }
    return NextResponse.next()
  }

  // Protect all other routes
  const { userId, sessionClaims } = await auth.protect()

  // Check if user has selected a role
  const role = (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role

  // Skip role check if coming from role selection (allow one redirect)
  const url = new URL(request.url)
  if (url.searchParams.has('role-set')) {
    return NextResponse.next()
  }

  // If no role, redirect to role selection
  if (!role && !request.url.includes('/select-role')) {
    return NextResponse.redirect(new URL('/select-role', request.url))
  }

  // Protect admin routes
  if (isAdminRoute(request) && role !== 'admin') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}