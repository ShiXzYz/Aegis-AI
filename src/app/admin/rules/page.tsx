'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Trash2, Edit2, Power, PowerOff, Sparkles } from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: string
  model_name: string | null
}

interface Rule {
  id: string
  name: string
  description: string | null
  classification_level: 'public' | 'internal' | 'confidential' | 'restricted'
  data_source_id: string
  organization_id: string
  priority: number
  is_active: boolean
  created_at: string
  data_source?: DataSource
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [classificationModelId, setClassificationModelId] = useState<string>('')
  const [organizationId, setOrganizationId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    classificationLevel: 'public' as 'public' | 'internal' | 'confidential' | 'restricted',
    dataSourceId: '',
    priority: 0
  })

  useEffect(() => {
    fetchRules()
    fetchDataSources()
    fetchOrganizationSettings()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data.rules || [])
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/admin/data-sources')
      if (response.ok) {
        const data = await response.json()
        setDataSources(data.dataSources || [])
      }
    } catch (error) {
      console.error('Error fetching data sources:', error)
    }
  }

  const fetchOrganizationSettings = async () => {
    try {
      // Get current user's organization through users API
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        if (usersData.users && usersData.users.length > 0) {
          const currentUserOrg = usersData.users[0].organization_id

          // Then get organization details
          const orgResponse = await fetch('/api/admin/organizations')
          if (orgResponse.ok) {
            const orgData = await orgResponse.json()
            const org = orgData.organizations?.find((o: any) => o.id === currentUserOrg)
            if (org) {
              setOrganizationId(org.id)
              setClassificationModelId(org.classification_data_source_id || '')
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const updateClassificationModel = async (dataSourceId: string) => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          classificationDataSourceId: dataSourceId || null
        })
      })

      if (response.ok) {
        setClassificationModelId(dataSourceId)
        alert('Classification model updated successfully')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update classification model')
      }
    } catch (error) {
      console.error('Error updating classification model:', error)
      alert('Failed to update classification model')
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.classificationLevel || !formData.dataSourceId) {
      alert('Please fill in name, classification level, and data source')
      return
    }

    try {
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Rule created successfully')
        setShowAddModal(false)
        setFormData({ name: '', description: '', classificationLevel: 'public', dataSourceId: '', priority: 0 })
        fetchRules()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create rule')
      }
    } catch (error) {
      console.error('Error creating rule:', error)
      alert('Failed to create rule')
    }
  }

  const handleUpdate = async () => {
    if (!selectedRule) return

    try {
      const response = await fetch('/api/admin/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: selectedRule.id,
          ...formData
        })
      })

      if (response.ok) {
        alert('Rule updated successfully')
        setShowEditModal(false)
        setSelectedRule(null)
        setFormData({ name: '', description: '', classificationLevel: 'public', dataSourceId: '', priority: 0 })
        fetchRules()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update rule')
      }
    } catch (error) {
      console.error('Error updating rule:', error)
      alert('Failed to update rule')
    }
  }

  const handleToggleActive = async (rule: Rule) => {
    try {
      const response = await fetch('/api/admin/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: rule.id,
          isActive: !rule.is_active
        })
      })

      if (response.ok) {
        alert(`Rule ${!rule.is_active ? 'activated' : 'deactivated'} successfully`)
        fetchRules()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to toggle rule')
      }
    } catch (error) {
      console.error('Error toggling rule:', error)
      alert('Failed to toggle rule')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/rules?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Rule deleted successfully')
        fetchRules()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete rule')
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
      alert('Failed to delete rule')
    }
  }

  const openEditModal = (rule: Rule) => {
    setSelectedRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description || '',
      classificationLevel: rule.classification_level,
      dataSourceId: rule.data_source_id,
      priority: rule.priority
    })
    setShowEditModal(true)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'confidential': return 'bg-orange-100 text-orange-800'
      case 'restricted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <AdminLayout title="Rules">
      {/* Header with Add Button */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">Configure AI model routing based on query classification</p>
        <button
          onClick={() => {
            setFormData({ name: '', description: '', classificationLevel: 'public', dataSourceId: '', priority: 0 })
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-[#E8E4F3] text-black rounded-full hover:bg-[#d8d0ed] transition font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Rule
        </button>
      </div>

      {/* Classification Model Selector */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Classification AI Model</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which AI model should analyze queries to determine their sensitivity level (Public, Internal, Confidential, or Restricted).
              This model will classify all queries before routing them to the appropriate response model based on your rules below.
            </p>
            <div className="flex items-center gap-3">
              <select
                value={classificationModelId}
                onChange={(e) => updateClassificationModel(e.target.value)}
                className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              >
                <option value="">Auto-select (use first active model)</option>
                {dataSources.filter(ds => ds).map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name} {source.model_name ? `(${source.model_name})` : ''}
                  </option>
                ))}
              </select>
              {classificationModelId && (
                <span className="text-sm text-green-700 font-medium whitespace-nowrap">
                  ✓ Custom model selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No rules configured. Add your first rule to enable classification-based routing.
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  {/* Rule Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    rule.is_active ? 'bg-[#E8E4F3]' : 'bg-gray-200'
                  }`}>
                    <span className={`font-semibold ${
                      rule.is_active ? 'text-black' : 'text-gray-500'
                    }`}>
                      {getInitial(rule.name)}
                    </span>
                  </div>

                  {/* Rule Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{rule.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getLevelColor(rule.classification_level)}`}>
                        {getLevelLabel(rule.classification_level)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Priority: {rule.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {rule.description || 'No description'}
                    </div>
                    {rule.data_source && (
                      <div className="text-xs text-gray-500 mt-1">
                        Routes to: {rule.data_source.name}
                        {rule.data_source.model_name && ` (${rule.data_source.model_name})`}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rule.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(rule)}
                      className={`p-2 rounded-lg transition ${
                        rule.is_active
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={rule.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {rule.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                    <button
                      onClick={() => openEditModal(rule)}
                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                      title="Edit rule"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id, rule.name)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Delete rule"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Rule Modal */}
      {(showAddModal || showEditModal) && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddModal(false)
            setShowEditModal(false)
            setSelectedRule(null)
            setFormData({ name: '', description: '', classificationLevel: 'public', dataSourceId: '', priority: 0 })
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#E8E4F3] rounded-lg flex items-center justify-center">
                  <Sparkles size={20} className="text-black" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {showAddModal ? 'Add Rule' : 'Edit Rule'}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Configure which AI model handles queries of a specific classification level
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Public Queries to ChatGPT"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classification Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.classificationLevel}
                  onChange={(e) => setFormData({ ...formData, classificationLevel: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Queries classified at this level will be routed to the selected AI model
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target AI Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dataSourceId}
                  onChange={(e) => setFormData({ ...formData, dataSourceId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                >
                  <option value="">Select AI model</option>
                  {dataSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} {source.model_name ? `(${source.model_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher priority rules are checked first (default: 0)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this rule should be used"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] resize-none bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedRule(null)
                  setFormData({ name: '', description: '', classificationLevel: 'public', dataSourceId: '', priority: 0 })
                }}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleCreate : handleUpdate}
                className="px-6 py-2 rounded-full bg-[#E8E4F3] text-black hover:bg-[#d8d0ed] transition font-medium"
              >
                {showAddModal ? 'Add Rule' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
