import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

// GET - Fetch data sources for admin's organization
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
      return NextResponse.json({ dataSources: [] })
    }

    // Fetch data sources for the admin's organization
    const { data: dataSources, error } = await supabaseAdmin
      .from('data_sources')
      .select('*')
      .eq('organization_id', adminUser.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching data sources:', error)
      return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 })
    }

    return NextResponse.json({ dataSources })
  } catch (error) {
    console.error('Admin data sources API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new data source
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
        error: 'Admin must be part of an organization to add data sources'
      }, { status: 400 })
    }

    const { name, type, apiKey, modelName } = await request.json()

    if (!name || !type || !apiKey) {
      return NextResponse.json({
        error: 'Name, type, and API key are required'
      }, { status: 400 })
    }

    // Create data source
    const { data: dataSource, error } = await supabaseAdmin
      .from('data_sources')
      .insert({
        name,
        type,
        api_key: apiKey,
        model_name: modelName || null,
        organization_id: adminUser.organization_id,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating data source:', error)
      return NextResponse.json({ error: 'Failed to create data source' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      dataSource,
      message: `Created data source "${name}"`
    })
  } catch (error) {
    console.error('Admin data sources create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update data source (activate/deactivate, edit details)
export async function PUT(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { dataSourceId, name, type, apiKey, modelName, isActive } = await request.json()

    if (!dataSourceId) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 })
    }

    // Build updates object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (type !== undefined) updates.type = type
    if (apiKey !== undefined) updates.api_key = apiKey
    if (modelName !== undefined) updates.model_name = modelName
    if (isActive !== undefined) updates.is_active = isActive

    const { data, error } = await supabaseAdmin
      .from('data_sources')
      .update(updates)
      .eq('id', dataSourceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating data source:', error)
      return NextResponse.json({ error: 'Failed to update data source' }, { status: 500 })
    }

    return NextResponse.json({ success: true, dataSource: data })
  } catch (error) {
    console.error('Admin data sources update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete data source
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dataSourceId = searchParams.get('id')

    if (!dataSourceId) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 })
    }

    // Delete data source
    const { error } = await supabaseAdmin
      .from('data_sources')
      .delete()
      .eq('id', dataSourceId)

    if (error) {
      console.error('Error deleting data source:', error)
      return NextResponse.json({ error: 'Failed to delete data source' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin data sources delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
