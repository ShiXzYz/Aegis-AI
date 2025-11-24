'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { CheckSquare, Square, X, Plus, Edit2, Trash2 } from 'lucide-react'

interface Group {
  id: string
  name: string
  description: string | null
  created_at: string
  users?: { count: number }[]
  checked?: boolean
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Group name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Group created successfully')
        setIsCreating(false)
        setFormData({ name: '', description: '' })
        fetchGroups()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group')
    }
  }

  const handleUpdate = async () => {
    if (!selectedGroup || !formData.name.trim()) {
      alert('Group name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          ...formData
        })
      })

      if (response.ok) {
        alert('Group updated successfully')
        setIsEditing(false)
        setSelectedGroup(null)
        setFormData({ name: '', description: '' })
        fetchGroups()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update group')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      alert('Failed to update group')
    }
  }

  const handleDelete = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"? All users in this group will be ungrouped.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/groups?id=${groupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Group deleted successfully')
        setSelectedGroup(null)
        fetchGroups()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('Failed to delete group')
    }
  }

  const openEditModal = (group: Group) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      description: group.description || ''
    })
    setIsEditing(true)
  }

  const getMemberCount = (group: Group) => {
    return group.users?.[0]?.count || 0
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const toggleGroup = (id: string) => {
    setGroups(groups.map(group =>
      group.id === id ? { ...group, checked: !group.checked } : group
    ))
  }

  return (
    <AdminLayout title="Groups">
      {/* Header with Create Button */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">Manage user groups and their members</p>
        <button
          onClick={() => {
            setFormData({ name: '', description: '' })
            setIsCreating(true)
          }}
          className="px-4 py-2 bg-[#E8E4F3] text-black rounded-full hover:bg-[#d8d0ed] transition font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No groups found. Create your first group to get started.
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button onClick={() => toggleGroup(group.id)} className="text-primary-600">
                    {group.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  {/* Group Avatar */}
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="w-12 h-12 rounded-full bg-[#E8E4F3] flex items-center justify-center flex-shrink-0 hover:bg-[#d8d0ed] transition"
                  >
                    <span className="font-semibold text-black">{getInitial(group.name)}</span>
                  </button>

                  {/* Group Info */}
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-900">{group.name}</div>
                    <div className="text-sm text-gray-600">
                      {getMemberCount(group)} {getMemberCount(group) === 1 ? 'member' : 'members'}
                    </div>
                  </button>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                      title="Edit group"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id, group.name)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Delete group"
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

      {/* View Group Details Modal */}
      {selectedGroup && !isEditing && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGroup(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E8E4F3] flex items-center justify-center">
                  <span className="font-semibold text-black">{getInitial(selectedGroup.name)}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">{selectedGroup.name}</div>
                  <div className="text-sm text-gray-600">{selectedGroup.description || 'No description'}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedGroup.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">
                    {selectedGroup.description || 'No description provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">
                    {getMemberCount(selectedGroup)} {getMemberCount(selectedGroup) === 1 ? 'member' : 'members'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">
                    {new Date(selectedGroup.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedGroup(null)}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => openEditModal(selectedGroup)}
                className="px-6 py-2 rounded-full bg-[#E8E4F3] text-black hover:bg-[#d8d0ed] transition"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Group Modal */}
      {(isCreating || isEditing) && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsCreating(false)
            setIsEditing(false)
            setSelectedGroup(null)
            setFormData({ name: '', description: '' })
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-900">
                {isCreating ? 'Create New Group' : 'Edit Group'}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setIsEditing(false)
                  setSelectedGroup(null)
                  setFormData({ name: '', description: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter group description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] resize-none bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setIsEditing(false)
                  setSelectedGroup(null)
                  setFormData({ name: '', description: '' })
                }}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="px-6 py-2 rounded-full bg-[#E8E4F3] text-black hover:bg-[#d8d0ed] transition font-medium"
              >
                {isCreating ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
