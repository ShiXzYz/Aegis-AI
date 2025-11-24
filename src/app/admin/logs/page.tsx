'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, Filter, Trash2, CheckSquare, Square, X } from 'lucide-react'

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
  checked?: boolean
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
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    aiModel: '',
    sensitivity: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [])

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
      setLogs((data.logs || []).map((log: ChatLog) => ({ ...log, checked: false })))
      setStats(data.stats || { totalQueries: 0, todayQueries: 0, uniqueUsers: 0 })
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLog = (id: string) => {
    setLogs(logs.map(log =>
      log.id === id ? { ...log, checked: !log.checked } : log
    ))
  }

  const toggleAll = () => {
    const allChecked = logs.every(log => log.checked)
    setLogs(logs.map(log => ({ ...log, checked: !allChecked })))
  }

  const handleDelete = async () => {
    const selectedLogs = logs.filter(log => log.checked)
    if (selectedLogs.length === 0) {
      alert('Please select logs to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedLogs.length} log(s)? This cannot be undone.`)) {
      return
    }

    try {
      const ids = selectedLogs.map(log => log.id).join(',')
      const response = await fetch(`/api/admin/logs?ids=${ids}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Logs deleted successfully')
        fetchLogs() // Refresh the list
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete logs')
      }
    } catch (error) {
      console.error('Error deleting logs:', error)
      alert('Failed to delete logs')
    }
  }

  const filteredLogs = logs.filter(log => {
    // Search filter (query, user name, email, AI model, sensitivity, time)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      log.query.toLowerCase().includes(searchLower) ||
      log.users?.name.toLowerCase().includes(searchLower) ||
      log.users?.email.toLowerCase().includes(searchLower) ||
      log.ai_model.toLowerCase().includes(searchLower) ||
      log.sensitivity_level.toLowerCase().includes(searchLower) ||
      new Date(log.created_at).toLocaleString().toLowerCase().includes(searchLower)

    // AI Model filter
    const matchesAiModel = !filters.aiModel || log.ai_model === filters.aiModel

    // Sensitivity filter
    const matchesSensitivity = !filters.sensitivity || log.sensitivity_level === filters.sensitivity

    // Date range filter
    const logDate = new Date(log.created_at)
    const matchesDateFrom = !filters.dateFrom || logDate >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || logDate <= new Date(filters.dateTo + 'T23:59:59')

    return matchesSearch && matchesAiModel && matchesSensitivity && matchesDateFrom && matchesDateTo
  })

  const getSensitivityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'restricted':
        return 'bg-red-100 text-red-800'
      case 'confidential':
        return 'bg-orange-100 text-orange-800'
      case 'internal':
        return 'bg-blue-100 text-blue-800'
      case 'public':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const uniqueAiModels = Array.from(new Set(logs.map(log => log.ai_model)))
  const uniqueSensitivityLevels = Array.from(new Set(logs.map(log => log.sensitivity_level)))
  const selectedCount = logs.filter(log => log.checked).length

  return (
    <AdminLayout title="Events">
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by query, user, email, AI model, sensitivity, or time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
              showFilters
                ? 'bg-[#E8E4F3] border-[#E8E4F3] text-black'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            Filters
          </button>
          {selectedCount > 0 && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 size={20} />
              Delete ({selectedCount})
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => {
                  setFilters({ aiModel: '', sensitivity: '', dateFrom: '', dateTo: '' })
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* AI Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <select
                  value={filters.aiModel}
                  onChange={(e) => setFilters({ ...filters, aiModel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                >
                  <option value="">All Models</option>
                  {uniqueAiModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Sensitivity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sensitivity</label>
                <select
                  value={filters.sensitivity}
                  onChange={(e) => setFilters({ ...filters, sensitivity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                >
                  <option value="">All Levels</option>
                  {uniqueSensitivityLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8E4F3] bg-gray-50 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={toggleAll}
                    className="text-gray-600 hover:text-black"
                  >
                    {logs.every(log => log.checked) ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleLog(log.id)}
                        className="text-gray-600 hover:text-black"
                      >
                        {log.checked ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
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
                        getSensitivityColor(log.sensitivity_level)
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
