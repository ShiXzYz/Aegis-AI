import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get role from Clerk's publicMetadata
    const clerkRole = (user.publicMetadata as { role?: string })?.role || 'user'

    // Update user's role in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: clerkRole })
      .eq('clerk_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error syncing role:', error)
      return NextResponse.json({ error: 'Failed to sync role' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Role synced to: ${clerkRole}`,
      user: data
    })
  } catch (error) {
    console.error('Sync role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
