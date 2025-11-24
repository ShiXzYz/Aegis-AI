'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, Plus, Settings, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import { Message } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [organization, setOrganization] = useState<{ name: string } | null>(null)
  const [errorNotification, setErrorNotification] = useState<string | null>(null)
  const { user } = useUser()
  const router = useRouter()

  const isAdmin = (user?.publicMetadata as { role?: string })?.role === 'admin'

  useEffect(() => {
    fetchUserOrganization()
  }, [user])

  const fetchUserOrganization = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/user/organization')
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setErrorNotification(null) // Clear any previous error

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      const data = await response.json()

      // Check for error responses
      if (data.error) {
        setErrorNotification(data.message || 'An error occurred')
        // Remove the user message since we couldn't process it
        setMessages((prev) => prev.slice(0, -1))
        return
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setErrorNotification('Sorry, there was an error processing your request.')
      // Remove the user message since we couldn't process it
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      {/* Sidebar - Thin bar that expands */}
      <div
        className={`${
          sidebarExpanded ? 'w-64' : 'w-20'
        } bg-[#E8E4F3] transition-all duration-300 ease-in-out flex flex-col items-center py-6 flex-shrink-0 relative`}
      >
        {/* Menu Toggle Button - fixed position in sidebar */}
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
            onClick={() => setMessages([])}
            className="w-full px-4 mb-3"
          >
            <div className="bg-white/60 hover:bg-white/80 rounded-full py-3 px-4 transition flex items-center gap-2">
              <Plus size={24} className="text-black" />
              <span className="text-black font-medium text-sm">New chat</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setMessages([])}
            className="w-12 h-12 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center justify-center mb-3"
            title="New chat"
          >
            <Plus size={24} className="text-black" />
          </button>
        )}

        {/* Organization Display/Join Button - only for non-admin users */}
        {!isAdmin && (
          organization ? (
            // Show current organization (clickable)
            sidebarExpanded ? (
              <button
                onClick={() => router.push('/my-organization')}
                className="w-full px-4 mb-6"
              >
                <div className="bg-white/60 hover:bg-white/80 rounded-full py-3 px-4 flex items-center gap-2 transition">
                  <Building2 size={20} className="text-black" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-black/70 font-medium">Organization</p>
                    <p className="text-sm font-semibold text-black truncate">{organization.name}</p>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => router.push('/my-organization')}
                className="w-12 h-12 bg-white/60 hover:bg-white/80 rounded-full transition flex items-center justify-center mx-auto mb-6"
                title={organization.name}
              >
                <Building2 size={20} className="text-black" />
              </button>
            )
          ) : (
            // Show join button if no organization
            sidebarExpanded ? (
              <button
                onClick={() => router.push('/join-organization')}
                className="w-full px-4 mb-6"
              >
                <div className="bg-white/60 hover:bg-white/80 rounded-full py-3 px-4 transition flex items-center gap-2">
                  <Building2 size={24} className="text-black" />
                  <span className="text-black font-medium text-sm">Join Organization</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => router.push('/join-organization')}
                className="w-12 h-12 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center justify-center mb-6"
                title="Join Organization"
              >
                <Building2 size={24} className="text-black" />
              </button>
            )
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex justify-end items-center px-6 py-4 border-b border-gray-100">
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Error Notification */}
        {errorNotification && (
          <div className="flex justify-center py-4 px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-3 max-w-2xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{errorNotification}</p>
                  {errorNotification.includes('administrator') && (
                    <p className="text-red-600 text-sm mt-1">
                      Contact your organization admin to configure an AI model.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setErrorNotification(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                Hello, {user?.firstName || 'Brian'}
              </h2>
              <div className="w-full max-w-lg">
                <MessageInput onSend={handleSendMessage} disabled={isLoading} />
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              {/* Input Area */}
              <div className="border-t border-gray-100">
                <MessageInput onSend={handleSendMessage} disabled={isLoading} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
