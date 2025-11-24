'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { CheckSquare, Square, X, Building2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  clerk_id: string
  organization_id: string | null
  created_at: string
  organization?: {
    name: string
    join_code: string
  }
  groups?: { name: string }[]
  checked?: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        credentials: 'include', // send cookies for Clerk auth
      })
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, checked: !user.checked } : user
    ))
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <AdminLayout title="Users">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-black">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-black">No users found</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button onClick={() => toggleUser(user.id)} className="text-primary-600">
                    {user.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  {/* User Avatar */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0 hover:bg-primary-300 transition"
                  >
                    <span className="font-semibold text-primary-800">{getInitial(user.name)}</span>
                  </button>

                  {/* User Info */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-black">{user.name}</div>
                    <div className="text-sm text-black">{user.email}</div>
                    {user.organization && (
                      <div className="flex items-center gap-1 mt-1">
                        <Building2 size={14} className="text-black/70" />
                        <span className="text-xs text-black/70">{user.organization.name}</span>
                      </div>
                    )}
                  </button>

                  {/* Role Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-black'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                  <span className="font-semibold text-primary-800">{getInitial(selectedUser.name)}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg text-black">{selectedUser.name}</div>
                  <div className="text-sm text-black">{selectedUser.email}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Role</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-black'
                }`}>
                  {selectedUser.role}
                </span>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Organization</label>
                {selectedUser.organization ? (
                  <div className="bg-[#E8E4F3] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-black" />
                      <div>
                        <p className="font-medium text-black">{selectedUser.organization.name}</p>
                        <p className="text-xs text-black/70">Code: {selectedUser.organization.join_code}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-black/70">No organization</p>
                )}
              </div>

              {/* Groups */}
              {selectedUser.groups && selectedUser.groups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Groups</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.groups.map((group, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-black">
                        {group.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Created At */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Joined</label>
                <p className="text-sm text-black">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 rounded-full border-2 border-gray-300 hover:bg-gray-50 transition font-medium text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}