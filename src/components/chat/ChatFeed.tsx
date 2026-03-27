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
      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(139,99,64,0.18)' }}>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(139,99,64,0.7)' }}>📢 活動ログ</span>
      </div>
      <div className="flex-1 overflow-y-auto chat-scroll px-3 py-2 space-y-1">
        {chatEvents.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'rgba(139,99,64,0.4)' }}>
            誰かが入室するとログが流れます
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
