import { auth, currentUser } from '@clerk/nextjs/server'

export async function getCurrentUserRole() {
  const user = await currentUser()
  if (!user) return undefined
  return (user.publicMetadata as { role?: 'user' | 'admin' })?.role
}

export async function isAdmin() {
  const user = await currentUser()
  if (!user) return false
  const role = (user.publicMetadata as { role?: string })?.role
  return role === 'admin'
}