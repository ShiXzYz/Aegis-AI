import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentUserRole } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check for bypass cookie (set by middleware when role was just selected)
  const cookieStore = await cookies()
  const roleJustSet = cookieStore.get('role-just-set')

  // If bypass is active, skip role check (role was just set and may not be in session yet)
  if (!roleJustSet) {
    const role = await getCurrentUserRole()

    if (role !== 'admin') {
      redirect('/chat')
    }
  }

  return <>{children}</>
}
