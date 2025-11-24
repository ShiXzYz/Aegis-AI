import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { joinCode } = await request.json()

    if (!joinCode) {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 })
    }

    // Find organization by join code
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('join_code', joinCode.toUpperCase())
      .single()

    if (orgError || !organization) {
      console.error('Organization not found:', orgError)
      return NextResponse.json({
        error: 'Invalid join code. Please check and try again.'
      }, { status: 404 })
    }

    // Get or create user in database
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, organization_id')
      .eq('clerk_id', userId)
      .single()

    if (!dbUser) {
      // Create user with this organization
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email: user?.emailAddresses[0]?.emailAddress || '',
          name: user?.fullName || user?.firstName || 'User',
          organization_id: organization.id,
          role: 'user'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully joined ${organization.name}!`,
        organization
      })
    }

    // Update existing user's organization
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ organization_id: organization.id })
      .eq('id', dbUser.id)

    if (updateError) {
      console.error('Error updating user organization:', updateError)
      return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${organization.name}!`,
      organization
    })
  } catch (error) {
    console.error('Join organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
