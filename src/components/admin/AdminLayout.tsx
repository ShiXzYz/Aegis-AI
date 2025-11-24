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
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

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
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return sidebarExpanded ? (
              <Link key={item.name} href={item.href} className="block px-4">
                <div className={`w-full py-3 px-4 rounded-full transition flex items-center gap-3 ${
                  isActive
                    ? 'bg-white/70 text-black font-semibold'
                    : 'bg-white/50 hover:bg-white/70 text-black'
                }`}>
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            ) : (
              <Link key={item.name} href={item.href}>
                <div
                  className={`w-12 h-12 rounded-full transition flex items-center justify-center mx-auto mb-2 ${
                    isActive
                      ? 'bg-white/70'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">{title}</h1>
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