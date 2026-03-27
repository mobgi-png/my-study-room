import React from 'react'
import { ChatEvent } from '../../types'

const typeColors: Record<ChatEvent['type'], string> = {
  join: 'text-green-400',
  milestone: 'text-yellow-400',
  pomodoro: 'text-red-400',
}

export default function ChatMessage({ event }: { event: ChatEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`text-xs chat-fade-in ${typeColors[event.type]}`}>
      <span className="text-gray-600 mr-1">{time}</span>
      {event.message}
    </div>
  )
}
