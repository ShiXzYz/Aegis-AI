import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get admin's organization_id
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('clerk_id', userId)
      .single()

    if (!adminUser || !adminUser.organization_id) {
      // Admin has no organization, return zeros
      return NextResponse.json({
        totalUsers: 0,
        totalGroups: 0,
        eventsToday: 0,
        activeModels: 1 // We're using gemini-2.5-flash
      })
    }

    // Count users in the admin's organization
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', adminUser.organization_id)

    // Count groups
    const { count: groupCount } = await supabaseAdmin
      .from('groups')
      .select('*', { count: 'exact', head: true })

    // Count events (chat_logs) from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: eventCount } = await supabaseAdmin
      .from('chat_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    return NextResponse.json({
      totalUsers: userCount || 0,
      totalGroups: groupCount || 0,
      eventsToday: eventCount || 0,
      activeModels: 1 // Currently using gemini-2.5-flash
    })
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
