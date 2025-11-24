import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('clerk_id', userId)
      .single()

    if (!user || !user.organization_id) {
      return NextResponse.json({ organization: null })
    }

    // Get organization details
    const { data: organization } = await supabaseAdmin
      .from('organizations')
      .select('name, join_code')
      .eq('id', user.organization_id)
      .single()

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('User organization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
