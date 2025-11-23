'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Trash2, Database } from 'lucide-react'

interface DataSource {
  id: string
  initial: string
  name: string
  type: string
  status: 'active' | 'inactive'
}

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: '1', initial: 'C', name: 'ChatGPT', type: 'OpenAI API', status: 'active' },
    { id: '2', initial: 'G', name: 'Google Gemini', type: 'Google AI', status: 'active' },
    { id: '3', initial: 'P', name: 'Perplexity', type: 'Perplexity AI', status: 'active' },
    { id: '4', initial: 'I', name: 'In-House AI', type: 'Custom Model', status: 'active' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSource, setNewSource] = useState({ name: '', apiKey: '', type: '' })

  const deleteSource = (id: string) => {
    if (confirm('Are you sure you want to delete this data source?')) {
      setDataSources(dataSources.filter(source => source.id !== id))
    }
  }

  const addSource = () => {
    if (!newSource.name || !newSource.apiKey) {
      alert('Please fill in all fields')
      return
    }

    const newDataSource: DataSource = {
      id: Date.now().toString(),
      initial: newSource.name.charAt(0).toUpperCase(),
      name: newSource.name,
      type: newSource.type || 'API',
      status: 'active'
    }

    setDataSources([...dataSources, newDataSource])
    setNewSource({ name: '', apiKey: '', type: '' })
    setShowAddModal(false)
  }

  return (
    <AdminLayout title="Data Sources">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-primary-600" />
            <h2 className="text-lg font-semibold">Data Sources</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus size={20} />
            Add Source
          </button>
        </div>

        {/* Data Sources List */}
        <div className="divide-y divide-gray-200">
          {dataSources.map((source) => (
            <div key={source.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                {/* Source Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-primary-800">{source.initial}</span>
                </div>

                {/* Source Info */}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{source.name}</div>
                  <div className="text-sm text-gray-500">{source.type}</div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    source.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {source.status}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteSource(source.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Data Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Add Data Source</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure a new AI model or data source
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Name
                </label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="e.g., Claude AI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newSource.apiKey}
                  onChange={(e) => setNewSource({ ...newSource, apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="OpenAI API">OpenAI API</option>
                  <option value="Anthropic API">Anthropic API</option>
                  <option value="Google AI">Google AI</option>
                  <option value="Custom Model">Custom Model</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewSource({ name: '', apiKey: '', type: '' })
                }}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addSource}
                className="px-6 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
              >
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}