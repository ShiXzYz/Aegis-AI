'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Menu, Plus, Settings, X } from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-2 hover:bg-accent rounded-lg transition-all duration-300"
        style={{ transform: isOpen ? 'translateX(256px)' : 'translateX(0)' }}
      >
        {isOpen ? <X size={24} color="#000000" strokeWidth={2.5} /> : <Menu size={24} color="#000000" strokeWidth={2.5} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#E8E4F3] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-6 pt-20">
          <button className="w-full bg-white/50 hover:bg-white/70 text-gray-700 py-3 px-4 rounded-full transition flex items-center justify-center gap-2 font-medium">
            <Plus size={20} />
            New chat
          </button>
        </div>

        {/* Chat History - will populate later */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-2">
            {/* Chat history items will go here */}
          </div>
        </div>

        {/* Settings at bottom */}
        <div className="p-6">
          <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </>
  )
}