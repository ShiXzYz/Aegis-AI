import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.error('No userId found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await req.json()

    if (!role || (role !== 'user' && role !== 'admin')) {
      console.error('Invalid role:', role)
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    console.log('Updating user', userId, 'with role:', role)

    // Update user metadata
    const client = await clerkClient()
    const updatedUser = await client.users.updateUser(userId, {
      publicMetadata: {
        role: role
      }
    })

    console.log('User metadata updated successfully')
    console.log('Verified role in Clerk:', (updatedUser.publicMetadata as any)?.role)

    return NextResponse.json({
      success: true,
      role,
      verified: (updatedUser.publicMetadata as any)?.role === role
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({
      error: 'Failed to update role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
