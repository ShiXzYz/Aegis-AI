import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getCurrentUserRole()

  if (role !== 'admin') {
    redirect('/chat')
  }

  return <>{children}</>
}