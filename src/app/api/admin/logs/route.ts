import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getChatLogs } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { sessionClaims } = await auth()
    const role = (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId') || undefined
    const groupId = searchParams.get('groupId') || undefined

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data, error } = await getChatLogs({
      organizationId,
      userId,
      groupId,
      limit: 100
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}