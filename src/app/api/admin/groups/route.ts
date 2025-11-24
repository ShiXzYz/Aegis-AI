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

    // Fetch all groups with user count
    const { data: groups, error } = await supabaseAdmin
      .from('groups')
      .select(`
        *,
        users:users(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Admin groups API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    // Create new group
    const { data, error } = await supabaseAdmin
      .from('groups')
      .insert({
        name,
        description: description || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      group: data,
      message: `Created group "${name}"`
    })
  } catch (error) {
    console.error('Admin groups create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update group
export async function PUT(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { groupId, name, description } = await request.json()

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description

    const { data, error } = await supabaseAdmin
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      console.error('Error updating group:', error)
      return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
    }

    return NextResponse.json({ success: true, group: data })
  } catch (error) {
    console.error('Admin groups update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('id')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Remove users from this group (set group_id to null)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ group_id: null })
      .eq('group_id', groupId)

    if (updateError) {
      console.error('Error removing users from group:', updateError)
      return NextResponse.json({ error: 'Failed to remove users from group' }, { status: 500 })
    }

    // Delete group
    const { error } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (error) {
      console.error('Error deleting group:', error)
      return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin groups delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
