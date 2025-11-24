'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, FileText, Database, UsersRound, Menu, X, Building2 } from 'lucide-react'
import { useState } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/logs', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { name: 'Groups', href: '/admin/groups', icon: UsersRound },
    { name: 'Data Sources', href: '/admin/data-sources', icon: Database },
    { name: 'Rules', href: '/admin/rules', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-[#F5F3FF] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-20' : 'w-0'
        } lg:w-20 bg-[#E8E4F3] transition-all duration-300 ease-in-out flex flex-col items-center py-6 flex-shrink-0`}
      >
        {/* Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-3 hover:bg-white/30 rounded-lg transition mb-6"
        >
          {sidebarOpen ? <X size={24} className="text-gray-900" /> : <Menu size={24} className="text-gray-900" />}
        </button>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-4 w-full items-center">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-900 hover:bg-white/30'
                }`}
                title={item.name}
              >
                <Icon size={24} />
              </Link>
            )
          })}
        </nav>

        {/* Settings at bottom */}
        <Link
          href="/admin/settings"
          className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-900 hover:bg-white/30 transition"
          title="Settings"
        >
          <Settings size={24} />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={24} className="text-gray-900" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}