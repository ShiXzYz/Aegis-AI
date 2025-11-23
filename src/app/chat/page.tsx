'use client'

import { useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, Plus, Settings } from 'lucide-react'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import { Message } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { user } = useUser()

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Spacer for button */}
        <div className="h-16 mb-6" />

        {/* New Chat Button */}
        {sidebarExpanded ? (
          <button
            onClick={() => setMessages([])}
            className="w-full px-4 mb-6"
          >
            <div className="bg-white/60 hover:bg-white/80 rounded-full py-3 px-4 transition flex items-center gap-2">
              <Plus size={24} className="text-gray-700" />
              <span className="text-gray-700 font-medium text-sm">New chat</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setMessages([])}
            className="w-12 h-12 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center justify-center mb-6"
            title="New chat"
          >
            <Plus size={24} className="text-gray-700" />
          </button>
        )}

        {/* Chat History - Only show when expanded */}
        {sidebarExpanded && (
          <div className="flex-1 w-full px-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Chat history items will go here */}
              <div className="text-sm text-gray-600 text-center py-4">
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
          <Settings size={24} className="text-gray-700" />
          {sidebarExpanded && <span className="text-gray-700">Settings</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex justify-end items-center px-6 py-4 border-b border-gray-100">
          <UserButton afterSignOutUrl="/" />
        </div>

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
