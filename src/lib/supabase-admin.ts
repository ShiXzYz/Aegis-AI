import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// User Management
export async function getAllUsers(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      groups (
        id,
        name
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function updateUserGroup(userId: string, groupId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ group_id: groupId })
    .eq('id', userId)

  return { data, error }
}

// Group Management
export async function getGroups(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .select(`
      *,
      users (count)
    `)
    .eq('organization_id', organizationId)

  return { data, error }
}

export async function createGroup(organizationId: string, name: string, description?: string) {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .insert({ organization_id: organizationId, name, description })
    .select()
    .single()

  return { data, error }
}

// Logging
export async function getChatLogs(filters: {
  organizationId: string
  userId?: string
  groupId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  let query = supabaseAdmin
    .from('chat_logs')
    .select(`
      *,
      users (
        name,
        email
      ),
      groups (
        name
      )
    `)
    .eq('organization_id', filters.organizationId)

  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters.groupId) {
    query = query.eq('group_id', filters.groupId)
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString())
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters.limit || 100)

  const { data, error } = await query

  return { data, error }
}

// Analytics
export async function getUserStats(organizationId: string) {
  const { data: totalUsers } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  const { data: totalLogs } = await supabaseAdmin
    .from('chat_logs')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  const { data: activeToday } = await supabaseAdmin
    .from('chat_logs')
    .select('user_id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

  return {
    totalUsers: totalUsers || 0,
    totalLogs: totalLogs || 0,
    activeToday: activeToday || 0
  }
}

// Rules Management
export async function getRules(organizationId: string, groupId?: string) {
  let query = supabaseAdmin
    .from('rules')
    .select('*')
    .eq('organization_id', organizationId)

  if (groupId) {
    query = query.eq('group_id', groupId)
  }

  const { data, error } = await query.order('priority', { ascending: false })

  return { data, error }
}

export async function createRule(rule: {
  organizationId: string
  groupId?: string
  sensitivityLevel: string
  aiModel: string
  priority: number
}) {
  const { data, error } = await supabaseAdmin
    .from('rules')
    .insert({
      organization_id: rule.organizationId,
      group_id: rule.groupId,
      sensitivity_level: rule.sensitivityLevel,
      ai_model: rule.aiModel,
      priority: rule.priority
    })
    .select()
    .single()

  return { data, error }
}