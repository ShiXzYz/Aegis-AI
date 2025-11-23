import { auth } from '@clerk/nextjs/server'

export async function getCurrentUserRole() {
  const { sessionClaims } = await auth()
  return (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role
}

export async function isAdmin() {
  const role = await getCurrentUserRole()
  return role === 'admin'
}