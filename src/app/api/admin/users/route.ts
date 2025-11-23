import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllUsers, updateUserGroup } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { sessionClaims } = await auth()
    const role = (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get organization ID from query params or user metadata
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { data, error } = await getAllUsers(organizationId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { sessionClaims } = await auth()
    const role = (sessionClaims?.publicMetadata as { role?: 'user' | 'admin' })?.role

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { userId, groupId } = await request.json()

    const { data, error } = await updateUserGroup(userId, groupId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}