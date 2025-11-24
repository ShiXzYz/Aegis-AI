'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { CheckSquare, Square, X } from 'lucide-react'

interface User {
  id: string
  initial: string
  name: string
  username: string
  groups: string[]
  checked: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', initial: 'A', name: 'Aleeza Khan', username: 'aleeza', groups: ['Employees', 'Developers'], checked: false },
    { id: '2', initial: 'B', name: 'Brian Ryu', username: 'brian', groups: ['Developers'], checked: false },
    { id: '3', initial: 'S', name: 'Shreyas Mayya', username: 'shreyas', groups: ['Designers'], checked: false },
  ])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const toggleUser = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, checked: !user.checked } : user
    ))
  }

  return (
    <AdminLayout title="Users">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
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
                  <span className="font-semibold text-primary-800">{user.initial}</span>
                </button>

                {/* User Info */}
                <button
                  onClick={() => setSelectedUser(user)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-900">({user.username})</div>
                </button>
              </div>
            </div>
          ))}
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
                  <span className="font-semibold text-primary-800">{selectedUser.initial}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">{selectedUser.name}</div>
                  <div className="text-sm text-gray-900">{selectedUser.username}</div>
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
            <div className="p-6">
              <div className="mb-6 bg-gray-50 rounded-lg p-6 flex items-center justify-center h-32">
                <div className="text-gray-600">User details placeholder</div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-900 mb-4">{selectedUser.username}</p>
                <p className="text-sm text-gray-900">
                  Member of groups: {selectedUser.groups.join(', ')}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button className="px-6 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}