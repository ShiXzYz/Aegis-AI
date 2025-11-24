'use client'

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText, Users, UsersRound, Database, Settings, MessageSquare, Building2, Menu } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalGroups: number
  eventsToday: number
  activeModels: number
}

export default function AdminDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalGroups: 0,
    eventsToday: 0,
    activeModels: 1,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users },
    { label: 'Total Groups', value: stats.totalGroups.toString(), icon: UsersRound },
    { label: 'Events Today', value: stats.eventsToday.toString(), icon: FileText },
    { label: 'Active Models', value: stats.activeModels.toString(), icon: Database },
  ]

  const quickActions = [
    { name: 'Events', href: '/admin/logs', icon: FileText, description: 'View all user queries and AI responses' },
    { name: 'Users', href: '/admin/users', icon: Users, description: 'Manage users and groups' },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2, description: 'Manage organizations and join codes' },
    { name: 'Groups', href: '/admin/groups', icon: UsersRound, description: 'Manage user groups' },
    { name: 'Rules', href: '/admin/rules', icon: Settings, description: 'Configure AI routing rules' },
    { name: 'Data Sources', href: '/admin/data-sources', icon: Database, description: 'Manage AI models' },
  ]

  const adminNavItems = [
    { name: 'Events', href: '/admin/logs', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { name: 'Groups', href: '/admin/groups', icon: UsersRound },
    { name: 'Data Sources', href: '/admin/data-sources', icon: Database },
    { name: 'Rules', href: '/admin/rules', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-[#F5F3FF] overflow-hidden">
      {/* Sidebar - Same style as user chat */}
      <div
        className={`${
          sidebarExpanded ? 'w-64' : 'w-20'
        } bg-[#E8E4F3] transition-all duration-300 ease-in-out flex flex-col items-center py-6 flex-shrink-0 relative`}
      >
        {/* Menu Toggle Button */}
        <div className="absolute top-6 left-[16px]">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-3 hover:bg-white/30 rounded-lg transition"
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={24} className="text-black" />
          </button>
        </div>

        {/* Spacer for button */}
        <div className="h-16 mb-6" />

        {/* Admin Navigation Items */}
        <div className="flex-1 w-full overflow-y-auto space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            return sidebarExpanded ? (
              <Link key={item.name} href={item.href} className="block px-4">
                <div className="w-full py-3 px-4 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center gap-3">
                  <Icon size={20} className="text-black" />
                  <span className="text-black font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            ) : (
              <Link key={item.name} href={item.href}>
                <div
                  className="w-12 h-12 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center justify-center mx-auto mb-2"
                  title={item.name}
                >
                  <Icon size={20} className="text-black" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-4 text-center text-gray-500">Loading stats...</div>
          ) : (
            statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900 font-medium">{stat.label}</span>
                    <Icon size={20} className="text-gray-900" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              )
            })
          )}
        </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.name} href={action.href}>
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#E8E4F3] rounded-lg flex items-center justify-center">
                          <Icon size={20} className="text-gray-900" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
                      </div>
                      <p className="text-gray-900 text-sm">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}