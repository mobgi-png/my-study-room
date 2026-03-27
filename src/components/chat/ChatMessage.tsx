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

      {/* アフィリエイトリンク（マイルストーン達成時のみ） */}
      {event.affiliate && (
        <a
          href={event.affiliate.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-0.5 flex items-center gap-1 text-gray-400 hover:text-yellow-300 transition-colors group"
        >
          <span>{event.affiliate.emoji}</span>
          <span className="underline underline-offset-2 group-hover:text-yellow-300">
            {event.affiliate.label}
          </span>
          <span className="text-gray-600 text-[10px] no-underline">PR</span>
        </a>
      )}
    </div>
  )
}
