'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Building2, ArrowRight, Menu, X } from 'lucide-react'

function OrganizationJoinedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const organizationName = searchParams.get('name') || 'your organization'
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleGoToChat = () => {
    // Force a reload when going to chat to refresh organization data
    router.push('/chat')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-[#E8E4F3] transition-all duration-300 ease-in-out flex flex-col flex-shrink-0 overflow-hidden`}
      >
        <div className="p-6">
          {/* Organization Name */}
          <div className="bg-white/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Building2 size={24} className="text-black" />
              <div>
                <p className="text-xs text-black/70 font-medium">Organization</p>
                <p className="text-sm font-semibold text-black">{organizationName}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <p className="text-xs text-black/70 font-medium">Account</p>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-50 p-3 hover:bg-gray-100 rounded-lg transition"
        style={{ transform: sidebarOpen ? 'translateX(256px)' : 'translateX(0)' }}
      >
        {sidebarOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} className="text-green-600" />
          </div>

          <h1 className="text-3xl font-semibold text-black mb-3">
            Successfully Joined!
          </h1>

          <p className="text-black mb-8">
            You are now a member of <strong>{organizationName}</strong>. You can start using the chat and access all organization resources.
          </p>

          <button
            onClick={handleGoToChat}
            className="w-full px-6 py-4 bg-[#E8E4F3] text-black rounded-full hover:bg-[#d8d0ed] transition font-medium flex items-center justify-center gap-2"
          >
            Go to Chat
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrganizationJoinedPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <OrganizationJoinedContent />
    </Suspense>
  )
}
