'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, CheckSquare, Square } from 'lucide-react'

interface LogEntry {
  id: string
  user: string
  username: string
  message: string
  timestamp: string
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  checked: boolean
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      user: 'B',
      username: 'brian',
      message: 'User brian entered confidential data into the prompt. The prompt was automatically redirected to the high-security LLM. No data is believed to have been compromised...',
      timestamp: new Date().toISOString(),
      sensitivityLevel: 'confidential',
      checked: false,
    },
    {
      id: '2',
      user: 'S',
      username: 'shreyas',
      message: 'User shreyas entered a prompt that requires access to the high-security LLM. shreyas is not in a group that can access this LLM, so the query was blocked.',
      timestamp: new Date().toISOString(),
      sensitivityLevel: 'restricted',
      checked: false,
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  const toggleSelectAll = () => {
    setSelectAll(!selectAll)
    setLogs(logs.map(log => ({ ...log, checked: !selectAll })))
  }

  const toggleLog = (id: string) => {
    setLogs(logs.map(log => 
      log.id === id ? { ...log, checked: !log.checked } : log
    ))
  }

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'confidential': return 'bg-orange-100 text-orange-800'
      case 'restricted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout title="Events">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Logs List */}
        <div className="divide-y divide-gray-200">
          {/* Select All Header */}
          <div className="p-4 flex items-center gap-3 bg-gray-50">
            <button onClick={toggleSelectAll} className="text-primary-600">
              {selectAll ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span className="text-sm font-medium text-gray-700">Select All</span>
          </div>

          {/* Log Entries */}
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button onClick={() => toggleLog(log.id)} className="text-primary-600 mt-1">
                  {log.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-primary-800">{log.user}</span>
                </div>

                {/* Log Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">User {log.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSensitivityColor(log.sensitivityLevel)}`}>
                      {log.sensitivityLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{log.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}