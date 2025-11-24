'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Building2, ArrowLeft, LogOut, Menu, Plus, Settings } from 'lucide-react'

export default function MyOrganizationPage() {
  const router = useRouter()
  const { user } = useUser()
  const [organization, setOrganization] = useState<{ name: string; join_code: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/organization')
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this organization? You will need a new join code to rejoin.')) {
      return
    }

    try {
      const response = await fetch('/api/user/leave-organization', {
        method: 'POST'
      })

      if (response.ok) {
        alert('Successfully left the organization')
        router.push('/chat')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to leave organization')
      }
    } catch (error) {
      console.error('Error leaving organization:', error)
      alert('Failed to leave organization')
    }
  }

  const userRole = (user?.publicMetadata as { role?: string })?.role || 'user'

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Same style as chat */}
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

        {/* New Chat Button */}
        {sidebarExpanded ? (
          <button
            onClick={() => router.push('/chat')}
            className="w-full px-4 mb-3"
          >
            <div className="bg-white/60 hover:bg-white/80 rounded-full py-3 px-4 transition flex items-center gap-2">
              <Plus size={24} className="text-black" />
              <span className="text-black font-medium text-sm">New chat</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => router.push('/chat')}
            className="w-12 h-12 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center justify-center mb-3"
            title="New chat"
          >
            <Plus size={24} className="text-black" />
          </button>
        )}

        {/* Organization Display (highlighted) */}
        {organization && (
          sidebarExpanded ? (
            <div className="w-full px-4 mb-6">
              <div className="bg-white/80 rounded-full py-3 px-4 flex items-center gap-2">
                <Building2 size={20} className="text-black" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-black/70 font-medium">Organization</p>
                  <p className="text-sm font-semibold text-black truncate">{organization.name}</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-12 h-12 bg-white/80 rounded-full transition flex items-center justify-center mx-auto mb-6"
              title={organization.name}
            >
              <Building2 size={20} className="text-black" />
            </div>
          )
        )}

        {/* Chat History - Only show when expanded */}
        {sidebarExpanded && (
          <div className="flex-1 w-full px-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Chat history items will go here */}
              <div className="text-sm text-black text-center py-4">
                No previous chats
              </div>
            </div>
          </div>
        )}

        {/* Spacer when collapsed */}
        {!sidebarExpanded && <div className="flex-1" />}

        {/* Settings Button */}
        <button
          className={`${
            sidebarExpanded ? 'w-full px-4 justify-start' : ''
          } p-3 hover:bg-white/30 rounded-lg transition flex items-center gap-2`}
          title="Settings"
        >
          <Settings size={24} className="text-black" />
          {sidebarExpanded && <span className="text-black">Settings</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/chat')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-black" />
              </button>
              <h1 className="text-2xl font-bold text-black">My Organization</h1>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          {loading ? (
            <div className="text-center">
              <p className="text-black">Loading...</p>
            </div>
          ) : !organization ? (
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-black mb-3">
                No Organization
              </h2>
              <p className="text-black mb-8">
                You're not part of any organization yet. Join one to collaborate with your team.
              </p>
              <button
                onClick={() => router.push('/join-organization')}
                className="w-full px-6 py-4 bg-[#E8E4F3] text-black rounded-full hover:bg-[#d8d0ed] transition font-medium"
              >
                Join Organization
              </button>
            </div>
          ) : (
            <div className="max-w-md w-full">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Organization Icon */}
                <div className="w-20 h-20 bg-[#E8E4F3] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 size={40} className="text-black" />
                </div>

                {/* Organization Details */}
                <div className="space-y-6">
                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Organization Name
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-lg font-semibold text-black">{organization.name}</p>
                    </div>
                  </div>

                  {/* Join Code */}
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Join Code
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-lg font-mono font-bold text-black">{organization.join_code}</p>
                      <p className="text-xs text-black/70 mt-1">Share this code with others to invite them</p>
                    </div>
                  </div>

                  {/* Your Role */}
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Your Role
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        userRole === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-200 text-black'
                      }`}>
                        {userRole === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>

                  {/* Leave Button */}
                  <button
                    onClick={handleLeave}
                    className="w-full px-6 py-4 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition font-medium flex items-center justify-center gap-2 border-2 border-red-200"
                  >
                    <LogOut size={20} />
                    Leave Organization
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
