import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, organization_id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.organization_id) {
      return NextResponse.json({ error: 'You are not in any organization' }, { status: 400 })
    }

    // Update user to remove from current organization (set to null)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ organization_id: null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error leaving organization:', updateError)
      return NextResponse.json({ error: 'Failed to leave organization' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully left organization'
    })
  } catch (error) {
    console.error('Leave organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
