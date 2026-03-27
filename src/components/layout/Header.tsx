import React from 'react'
import { useSeats } from '../../contexts/SeatsContext'

interface HeaderProps {
  onLeave?: () => void
  isSeated: boolean
}

export default function Header({ onLeave, isSeated }: HeaderProps) {
  const { onlineCount } = useSeats()

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-white">📚 もくもく自習室</span>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
          🟢 {onlineCount}人在室
        </span>
      </div>
      {isSeated && (
        <button
          onClick={onLeave}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          退席する
        </button>
      )}
    </header>
  )
}
