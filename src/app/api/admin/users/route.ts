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
    let { data: adminUser, error: adminUserError } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('clerk_id', userId)
      .single()

    console.log('Admin user lookup:', { adminUser, adminUserError, userId })

    // If admin doesn't exist in database, create them
    if (!adminUser) {
      const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
      if (clerkUser) {
        const userRole = (clerkUser.publicMetadata as { role?: string })?.role || 'user'
        const { data: newUser } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: userId,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            name: clerkUser.fullName || clerkUser.firstName || 'User',
            organization_id: null,
            role: userRole,
          })
          .select('organization_id')
          .single()

        adminUser = newUser
        console.log('Created admin user in database:', newUser)
      }
    }

    // If admin has no organization, return empty list
    if (!adminUser || !adminUser.organization_id) {
      console.log('Admin has no organization, returning empty list')
      return NextResponse.json({ users: [] })
    }

    console.log('Fetching users for organization:', adminUser.organization_id)

    // Fetch users from the same organization as the admin
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('organization_id', adminUser.organization_id)
      .order('created_at', { ascending: false })

    if (usersError) throw usersError

    const { data: organizations } = await supabaseAdmin
      .from('organizations')
      .select('id, name, join_code')

    const { data: groups } = await supabaseAdmin
      .from('groups')
      .select('id, name')

    const orgMap = new Map(organizations?.map(org => [org.id, org]) || [])
    const groupMap = new Map(groups?.map(group => [group.id, group]) || [])

    const enrichedUsers = users?.map(user => ({
      ...user,
      organization: user.organization_id ? orgMap.get(user.organization_id) : null,
      groups: user.group_id ? [groupMap.get(user.group_id)].filter(Boolean) : []
    }))

    return NextResponse.json({ users: enrichedUsers })
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