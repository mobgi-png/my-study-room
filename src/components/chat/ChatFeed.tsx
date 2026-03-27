import React, { useEffect, useRef } from 'react'
import { useSeats } from '../../contexts/SeatsContext'
import ChatMessage from './ChatMessage'

export default function ChatFeed() {
  const { chatEvents } = useSeats()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatEvents])

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">📢 活動ログ</span>
      </div>
      <div className="flex-1 overflow-y-auto chat-scroll px-3 py-2 space-y-1">
        {chatEvents.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            誰かが着席するとメッセージが表示されます
          </p>
        )}
        {chatEvents.map((event) => (
          <ChatMessage key={event.id} event={event} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
