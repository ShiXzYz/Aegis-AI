import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { currentUser } from '@clerk/nextjs/server'

// Generate 8-character alphanumeric code (like Engauge)
function generateOrgCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false

  const role = (user?.publicMetadata as { role?: string })?.role
  return role === 'admin'
}

// GET - Fetch all organizations
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

    // Fetch all organizations with user count
    const { data: organizations, error } = await supabaseAdmin
      .from('organizations')
      .select(`
        *,
        users:users(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
    }

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Admin organizations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new organization
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
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    // Generate unique join code
    let joinCode = generateOrgCode()
    let isUnique = false
    let attempts = 0

    // Ensure code is unique (try up to 10 times)
    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('join_code', joinCode)
        .single()

      if (!existing) {
        isUnique = true
      } else {
        joinCode = generateOrgCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
    }

    // Create organization
    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .insert({
        name,
        description: description || null,
        join_code: joinCode
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating organization:', error)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Automatically add the admin to the organization they just created
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (adminUser) {
      // Update admin's organization_id
      await supabaseAdmin
        .from('users')
        .update({ organization_id: organization.id })
        .eq('id', adminUser.id)
    }

    return NextResponse.json({
      success: true,
      organization,
      message: `Created organization "${name}" with code ${joinCode}`
    })
  } catch (error) {
    console.error('Admin organizations create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update organization
export async function PUT(request: Request) {
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

    const { organizationId, name, description, classificationDataSourceId } = await request.json()

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (classificationDataSourceId !== undefined) updates.classification_data_source_id = classificationDataSourceId

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating organization:', error)
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
    }

    return NextResponse.json({ success: true, organization: data })
  } catch (error) {
    console.error('Admin organizations update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete organization
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
    const organizationId = searchParams.get('id')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Remove all users from this organization (set organization_id to null)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ organization_id: null })
      .eq('organization_id', organizationId)

    if (updateError) {
      console.error('Error removing users from organization:', updateError)
      return NextResponse.json({ error: 'Failed to remove users from organization' }, { status: 500 })
    }

    // Delete organization
    const { error } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', organizationId)

    if (error) {
      console.error('Error deleting organization:', error)
      return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin organizations delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
