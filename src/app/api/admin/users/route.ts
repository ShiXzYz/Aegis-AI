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

    // Fetch all users with their organization and groups
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        organization:organization_id (
          name,
          join_code
        ),
        groups:group_id (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { userId, groupId, role } = await request.json()

    // Update user's group or role
    const updates: any = {}
    if (groupId !== undefined) updates.group_id = groupId
    if (role !== undefined) updates.role = role

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    console.error('Admin users update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}