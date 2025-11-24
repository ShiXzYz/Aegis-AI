'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Trash2, Database, Edit2, Power, PowerOff, Eye, EyeOff } from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: string
  api_key: string
  model_name: string | null
  organization_id: string
  is_active: boolean
  created_at: string
}

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null)
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
    modelName: ''
  })

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/data-sources')
      if (response.ok) {
        const data = await response.json()
        setDataSources(data.dataSources || [])
      }
    } catch (error) {
      console.error('Error fetching data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.type || !formData.apiKey) {
      alert('Please fill in name, type, and API key')
      return
    }

    try {
      const response = await fetch('/api/admin/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Data source created successfully')
        setShowAddModal(false)
        setFormData({ name: '', type: '', apiKey: '', modelName: '' })
        fetchDataSources()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create data source')
      }
    } catch (error) {
      console.error('Error creating data source:', error)
      alert('Failed to create data source')
    }
  }

  const handleUpdate = async () => {
    if (!selectedSource) return

    try {
      const response = await fetch('/api/admin/data-sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSourceId: selectedSource.id,
          ...formData
        })
      })

      if (response.ok) {
        alert('Data source updated successfully')
        setShowEditModal(false)
        setSelectedSource(null)
        setFormData({ name: '', type: '', apiKey: '', modelName: '' })
        fetchDataSources()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update data source')
      }
    } catch (error) {
      console.error('Error updating data source:', error)
      alert('Failed to update data source')
    }
  }

  const handleToggleActive = async (dataSource: DataSource) => {
    try {
      const response = await fetch('/api/admin/data-sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSourceId: dataSource.id,
          isActive: !dataSource.is_active
        })
      })

      if (response.ok) {
        alert(`Data source ${!dataSource.is_active ? 'activated' : 'deactivated'} successfully`)
        fetchDataSources()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to toggle data source')
      }
    } catch (error) {
      console.error('Error toggling data source:', error)
      alert('Failed to toggle data source')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/data-sources?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Data source deleted successfully')
        fetchDataSources()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete data source')
      }
    } catch (error) {
      console.error('Error deleting data source:', error)
      alert('Failed to delete data source')
    }
  }

  const openEditModal = (source: DataSource) => {
    setSelectedSource(source)
    setFormData({
      name: source.name,
      type: source.type,
      apiKey: source.api_key,
      modelName: source.model_name || ''
    })
    setShowEditModal(true)
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '••••••••'
    return apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4)
  }

  return (
    <AdminLayout title="Data Sources">
      {/* Header with Add Button */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">Manage AI models and API keys for your organization</p>
        <button
          onClick={() => {
            setFormData({ name: '', type: '', apiKey: '', modelName: '' })
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-[#E8E4F3] text-black rounded-full hover:bg-[#d8d0ed] transition font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Data Source
        </button>
      </div>

      {/* Data Sources List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading data sources...</div>
          ) : dataSources.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No data sources configured. Add your first AI model to get started.
            </div>
          ) : (
            dataSources.map((source) => (
              <div key={source.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  {/* Source Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    source.is_active ? 'bg-[#E8E4F3]' : 'bg-gray-200'
                  }`}>
                    <span className={`font-semibold ${
                      source.is_active ? 'text-black' : 'text-gray-500'
                    }`}>
                      {getInitial(source.name)}
                    </span>
                  </div>

                  {/* Source Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{source.name}</span>
                      {source.model_name && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {source.model_name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span>{source.type}</span>
                      <span>•</span>
                      <button
                        onClick={() => toggleApiKeyVisibility(source.id)}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        {showApiKey[source.id] ? (
                          <>
                            <EyeOff size={14} />
                            <span className="font-mono text-xs">{source.api_key}</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            <span className="font-mono text-xs">{maskApiKey(source.api_key)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    source.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(source)}
                      className={`p-2 rounded-lg transition ${
                        source.is_active
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={source.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {source.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                    <button
                      onClick={() => openEditModal(source)}
                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                      title="Edit data source"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id, source.name)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Delete data source"
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

      {/* Add/Edit Data Source Modal */}
      {(showAddModal || showEditModal) && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddModal(false)
            setShowEditModal(false)
            setSelectedSource(null)
            setFormData({ name: '', type: '', apiKey: '', modelName: '' })
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">
                {showAddModal ? 'Add Data Source' : 'Edit Data Source'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure AI model API credentials for your organization
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., ChatGPT, Claude, Gemini"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                >
                  <option value="">Select AI provider</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="perplexity">Perplexity AI</option>
                  <option value="custom">Custom Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API key will be encrypted and stored securely
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  placeholder="e.g., gpt-4, claude-3-opus"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedSource(null)
                  setFormData({ name: '', type: '', apiKey: '', modelName: '' })
                }}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleCreate : handleUpdate}
                className="px-6 py-2 rounded-full bg-[#E8E4F3] text-black hover:bg-[#d8d0ed] transition font-medium"
              >
                {showAddModal ? 'Add Data Source' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
