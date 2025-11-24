'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, Filter } from 'lucide-react'

interface ChatLog {
  id: string
  query: string
  response: string
  ai_model: string
  sensitivity_level: string
  created_at: string
  users: {
    name: string
    email: string
  }
  groups: {
    name: string
  } | null
}

interface Stats {
  totalQueries: number
  todayQueries: number
  uniqueUsers: number
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<Stats>({ totalQueries: 0, todayQueries: 0, uniqueUsers: 0 })

  useEffect(() => {
    fetchLogs()
  }, [searchQuery])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/logs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data = await response.json()
      setLogs(data.logs || [])
      setStats(data.stats || { totalQueries: 0, todayQueries: 0, uniqueUsers: 0 })
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.users?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout title="Events">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="mb-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-900 font-medium">Total Queries</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalQueries}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-900 font-medium">Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.todayQueries}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-900 font-medium">Unique Users (Today)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-900 font-medium">AI Models Used</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(logs.map(log => log.ai_model)).size}
            </p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  AI Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Sensitivity
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.users?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.users?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {log.query}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.ai_model}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.sensitivity_level === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : log.sensitivity_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {log.sensitivity_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}