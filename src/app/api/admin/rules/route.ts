import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { sessionClaims } = await auth()
    const role = (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    // For now, get all logs regardless of org (we'll filter later)
    const { data, error } = await supabase
      .from('chat_logs')
      .select(`
        *,
        users (
          name,
          email
        ),
        groups (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}