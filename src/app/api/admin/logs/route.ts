import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabaseAdmin
      .from('chat_logs')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add search filter if provided
    if (search) {
      query = query.or(`query.ilike.%${search}%,response.ilike.%${search}%`)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Error fetching logs:', error)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    // Get stats for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabaseAdmin
      .from('chat_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get unique users count
    const { data: uniqueUsers } = await supabaseAdmin
      .from('chat_logs')
      .select('user_id')
      .gte('created_at', today.toISOString())

    const uniqueUserCount = new Set(uniqueUsers?.map(log => log.user_id)).size

    return NextResponse.json({
      logs,
      total: count || 0,
      stats: {
        totalQueries: count || 0,
        todayQueries: todayCount || 0,
        uniqueUsers: uniqueUserCount,
      }
    })
  } catch (error) {
    console.error('Admin logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
