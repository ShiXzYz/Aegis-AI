'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { CheckSquare, Square, X } from 'lucide-react'

interface Group {
  id: string
  initial: string
  name: string
  description: string
  members: string[]
  checked: boolean
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', initial: 'D', name: 'Designers', description: 'Group of all designers in company', members: ['shreyas'], checked: false },
    { id: '2', initial: 'D', name: 'Developers', description: 'All software developers', members: ['brian', 'aleeza'], checked: false },
    { id: '3', initial: 'E', name: 'Employees', description: 'General employees', members: ['aleeza'], checked: false },
    { id: '4', initial: 'H', name: 'High Security', description: 'High security clearance', members: [], checked: false },
  ])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const toggleGroup = (id: string) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, checked: !group.checked } : group
    ))
  }

  return (
    <AdminLayout title="Groups">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {groups.map((group) => (
            <div key={group.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button onClick={() => toggleGroup(group.id)} className="text-primary-600">
                  {group.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                {/* Group Avatar */}
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0 hover:bg-primary-300 transition"
                >
                  <span className="font-semibold text-primary-800">{group.initial}</span>
                </button>

                {/* Group Info */}
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-gray-900">{group.name}</div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Details Modal */}
      {selectedGroup && (
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
                <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                  <span className="font-semibold text-primary-800">{selectedGroup.initial}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">{selectedGroup.name}</div>
                  <div className="text-sm text-gray-900">{selectedGroup.description}</div>
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
              <div className="mb-6 bg-gray-50 rounded-lg p-6 flex items-center justify-center h-32">
                <div className="text-gray-600">Group icons placeholder</div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{selectedGroup.name}</h3>
                <p className="text-gray-900 mb-4">{selectedGroup.description}</p>
                <p className="text-sm text-gray-900">
                  Members: {selectedGroup.members.length > 0 ? selectedGroup.members.join(', ') : 'No members'}
                </p>
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