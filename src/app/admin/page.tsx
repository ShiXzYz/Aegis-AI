import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText, Users, UsersRound, Database, Settings, MessageSquare, Building2 } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '24', icon: Users },
    { label: 'Total Groups', value: '4', icon: UsersRound },
    { label: 'Events Today', value: '156', icon: FileText },
    { label: 'Active Models', value: '4', icon: Database },
  ]

  const quickActions = [
    { name: 'Events', href: '/admin/logs', icon: FileText, description: 'View all user queries and AI responses' },
    { name: 'Users', href: '/admin/users', icon: Users, description: 'Manage users and groups' },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2, description: 'Manage organizations and join codes' },
    { name: 'Groups', href: '/admin/groups', icon: UsersRound, description: 'Manage user groups' },
    { name: 'Rules', href: '/admin/rules', icon: Settings, description: 'Configure AI routing rules' },
    { name: 'Data Sources', href: '/admin/data-sources', icon: Database, description: 'Manage AI models' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, description: 'Access the AI chat' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
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
          })}
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
  )
}