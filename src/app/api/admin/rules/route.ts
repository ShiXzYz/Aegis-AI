import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

// GET - Fetch rules for admin's organization
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get admin's organization_id
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('clerk_id', userId)
      .single()

    if (!adminUser || !adminUser.organization_id) {
      return NextResponse.json({ rules: [] })
    }

    // Fetch rules for the admin's organization with data source info
    const { data: rules, error } = await supabaseAdmin
      .from('rules')
      .select(`
        *,
        data_source:data_sources(id, name, type, model_name)
      `)
      .eq('organization_id', adminUser.organization_id)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching rules:', error)
      return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
    }

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Admin rules API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new rule
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get admin's organization_id
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('clerk_id', userId)
      .single()

    if (!adminUser || !adminUser.organization_id) {
      return NextResponse.json({
        error: 'Admin must be part of an organization to add rules'
      }, { status: 400 })
    }

    const { name, description, classificationLevel, dataSourceId, priority } = await request.json()

    if (!name || !classificationLevel || !dataSourceId) {
      return NextResponse.json({
        error: 'Name, classification level, and data source are required'
      }, { status: 400 })
    }

    // Validate classification level
    const validLevels = ['public', 'internal', 'confidential', 'restricted']
    if (!validLevels.includes(classificationLevel)) {
      return NextResponse.json({
        error: 'Invalid classification level. Must be: public, internal, confidential, or restricted'
      }, { status: 400 })
    }

    // Verify the data source belongs to the same organization
    const { data: dataSource } = await supabaseAdmin
      .from('data_sources')
      .select('organization_id')
      .eq('id', dataSourceId)
      .single()

    if (!dataSource || dataSource.organization_id !== adminUser.organization_id) {
      return NextResponse.json({
        error: 'Invalid data source or data source does not belong to your organization'
      }, { status: 400 })
    }

    // Create rule
    const { data: rule, error } = await supabaseAdmin
      .from('rules')
      .insert({
        name,
        description: description || null,
        classification_level: classificationLevel,
        data_source_id: dataSourceId,
        organization_id: adminUser.organization_id,
        priority: priority || 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating rule:', error)
      return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      rule,
      message: `Created rule "${name}"`
    })
  } catch (error) {
    console.error('Admin rules create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update rule (activate/deactivate, edit details)
export async function PUT(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { ruleId, name, description, classificationLevel, dataSourceId, priority, isActive } = await request.json()

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Validate classification level if provided
    if (classificationLevel) {
      const validLevels = ['public', 'internal', 'confidential', 'restricted']
      if (!validLevels.includes(classificationLevel)) {
        return NextResponse.json({
          error: 'Invalid classification level. Must be: public, internal, confidential, or restricted'
        }, { status: 400 })
      }
    }

    // Build updates object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (classificationLevel !== undefined) updates.classification_level = classificationLevel
    if (dataSourceId !== undefined) updates.data_source_id = dataSourceId
    if (priority !== undefined) updates.priority = priority
    if (isActive !== undefined) updates.is_active = isActive

    const { data, error } = await supabaseAdmin
      .from('rules')
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single()

    if (error) {
      console.error('Error updating rule:', error)
      return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
    }

    return NextResponse.json({ success: true, rule: data })
  } catch (error) {
    console.error('Admin rules update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete rule
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Delete rule
    const { error } = await supabaseAdmin
      .from('rules')
      .delete()
      .eq('id', ruleId)

    if (error) {
      console.error('Error deleting rule:', error)
      return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin rules delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
