'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Building2, Plus, Copy, Check, Trash2, Edit, Users } from 'lucide-react'

interface Organization {
  id: string
  name: string
  description: string | null
  join_code: string
  created_at: string
  users?: { count: number }[]
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newOrg, setNewOrg] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')

      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOrganization = async () => {
    if (!newOrg.name.trim()) {
      alert('Organization name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrg)
      })

      if (!response.ok) throw new Error('Failed to create organization')

      const data = await response.json()
      alert(data.message)

      setShowCreateModal(false)
      setNewOrg({ name: '', description: '' })
      fetchOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Failed to create organization')
    }
  }

  const deleteOrganization = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/organizations?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete organization')
      }

      alert('Organization deleted successfully')
      fetchOrganizations()
    } catch (error: any) {
      console.error('Error deleting organization:', error)
      alert(error.message || 'Failed to delete organization')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getUserCount = (org: Organization) => {
    return org.users?.[0]?.count || 0
  }

  return (
    <AdminLayout title="Organizations">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-black" />
            <h2 className="text-lg font-semibold text-black">Organizations</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8E4F3] text-black rounded-xl hover:bg-[#d8d0ed] transition font-medium"
          >
            <Plus size={20} />
            Create Organization
          </button>
        </div>

        {/* Organizations List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-black">Loading organizations...</div>
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center text-black">No organizations yet. Create one to get started!</div>
          ) : (
            organizations.map((org) => (
              <div key={org.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  {/* Organization Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-black">{org.name}</h3>
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-black">
                        <Users size={14} />
                        {getUserCount(org)} users
                      </span>
                    </div>
                    {org.description && (
                      <p className="text-sm text-black mb-3">{org.description}</p>
                    )}

                    {/* Join Code */}
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-[#E8E4F3] rounded-lg">
                        <span className="text-xs text-black font-medium">Join Code:</span>
                        <span className="ml-2 text-lg font-bold text-black font-mono">{org.join_code}</span>
                      </div>
                      <button
                        onClick={() => copyCode(org.join_code)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="Copy code"
                      >
                        {copiedCode === org.join_code ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} className="text-black" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteOrganization(org.id, org.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete organization"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-lg text-black">Create New Organization</h3>
              <p className="text-sm text-black mt-1">
                A unique 8-character code will be automatically generated
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  placeholder="e.g., Marketing Team, Engineering Dept"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#E8E4F3] focus:ring-[#E8E4F3] text-black placeholder:text-black/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                  placeholder="Brief description of this organization..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#E8E4F3] focus:ring-[#E8E4F3] text-black placeholder:text-black/50"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewOrg({ name: '', description: '' })
                }}
                className="px-6 py-2 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition font-medium text-black"
              >
                Cancel
              </button>
              <button
                onClick={createOrganization}
                className="px-6 py-2 rounded-xl bg-[#E8E4F3] text-black hover:bg-[#d8d0ed] transition font-medium"
              >
                Create Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
