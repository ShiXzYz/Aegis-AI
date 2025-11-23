'use client'

import { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 px-6 py-6 space-y-4 max-w-4xl mx-auto w-full">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-3xl px-6 py-4 max-w-2xl ${
              message.role === 'user'
                ? 'bg-[#E8E4F3] text-gray-900 ml-auto'
                : 'bg-[#E8E4F3] text-gray-900'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}