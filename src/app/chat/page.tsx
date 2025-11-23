'use client'

import { useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, Plus, Settings, X } from 'lucide-react'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import { Message } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true) // Open by default
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
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Always visible, slides in/out */}
      <div
        className={`${
          sidebarOpen ? 'w-20' : 'w-0'
        } bg-[#E8E4F3] transition-all duration-300 ease-in-out flex flex-col items-center py-6 overflow-hidden`}
      >
        {/* Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 hover:bg-white/30 rounded-lg transition mb-6"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* New Chat Button */}
        <button
          onClick={() => setMessages([])}
          className="w-12 h-12 bg-white/50 hover:bg-white/70 rounded-full transition flex items-center justify-center mb-6"
          title="New chat"
        >
          <Plus size={24} />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings Button */}
        <button className="p-3 hover:bg-white/30 rounded-lg transition">
          <Settings size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
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