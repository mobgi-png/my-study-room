import React, { useState } from 'react'
import { ChatEvent } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { sendReaction } from '../../firebase/reactions'

const REACTION_EMOJIS = ['💪', '☕', '📚', '🔥', '✨']

const typeColors: Record<ChatEvent['type'], string> = {
  join: 'text-green-400',
  milestone: 'text-yellow-400',
  pomodoro: 'text-red-400',
  reaction: 'text-blue-400',
}

export default function ChatMessage({ event }: { event: ChatEvent }) {
  const { nickname } = useAuth()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const time = new Date(event.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  // 自分自身の入室には応援ボタンを表示しない
  const canReact = event.type === 'join' && event.nickname && event.nickname !== nickname && !sent

  async function handleReaction(emoji: string) {
    if (!nickname || !event.nickname || sending) return
    setSending(true)
    try {
      await sendReaction(nickname, event.nickname, emoji)
      setSent(true)
    } catch {
      // エラー時はサイレントに無視
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`text-xs ${typeColors[event.type]}`}>
      <span className="text-gray-600 mr-1">{time}</span>
      {event.message}

      {/* 応援ボタン（入室メッセージにのみ表示） */}
      {canReact && (
        <div className="flex gap-1 mt-1 ml-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={sending}
              className="text-base hover:scale-125 transition-transform active:scale-95 disabled:opacity-50"
              title={`${event.nickname}さんに応援を送る`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {sent && event.type === 'join' && (
        <span className="ml-1 text-blue-400 text-[10px]">応援を送りました！</span>
      )}

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
