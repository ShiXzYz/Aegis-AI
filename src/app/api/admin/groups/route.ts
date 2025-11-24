import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
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

    // Fetch all groups
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .order('name', { ascending: true })

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

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create new group
    const { data, error } = await supabase
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

    return NextResponse.json({ success: true, group: data })
  } catch (error) {
    console.error('Admin groups create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('id')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Delete group
    const { error } = await supabase
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
