import React from 'react'
import { SeatConfig, SeatDoc } from '../../types'
import SeatDurationBadge from './SeatDurationBadge'
import { useStats } from '../../contexts/StatsContext'

interface SeatProps {
  config: SeatConfig
  occupant: SeatDoc | undefined
  isMine: boolean
  isOccupied: boolean
  isClaiming: boolean
  onClick: () => void
}

function nickColor(name: string): string {
  const colors = ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899','#14B8A6']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function Seat({ config, occupant, isMine, isOccupied, isClaiming, onClick }: SeatProps) {
  const { stats } = useStats()
  const isAdmin = !!occupant && stats.adminUids.includes(occupant.occupantUid)
  const pomodoroActive = occupant?.pomodoroMode === 'work'
  const isClickable = !isOccupied || isMine

  // アイコン決定（管理者は「も」文字、その他は絵文字）
  const adminIconEl = (
    <span style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#000', lineHeight: 1 }}>
      も
    </span>
  )
  let iconEl: React.ReactNode = '🪑'
  if (isClaiming) iconEl = '⏳'
  else if (isAdmin) iconEl = adminIconEl
  else if (isMine) iconEl = '⭐'
  else if (isOccupied) iconEl = '👤'

  // チェアボックスのスタイル
  let boxStyle = 'bg-gray-600 hover:bg-gray-500 hover:shadow-lg hover:shadow-black/40'
  if (isAdmin && isMine) {
    boxStyle = 'ring-2 ring-gray-400 bg-white shadow-white/20'
  } else if (isAdmin) {
    boxStyle = 'ring-2 ring-gray-300 bg-white opacity-95'
  } else if (isMine) {
    boxStyle = 'ring-2 ring-yellow-400 bg-yellow-800 shadow-yellow-900/50'
  } else if (isClaiming) {
    boxStyle = 'bg-blue-700 animate-pulse'
  } else if (isOccupied) {
    boxStyle = 'bg-gray-700 opacity-80'
  }

  const titleText = isMine
    ? 'クリックで退室'
    : isAdmin
    ? `👑 管理者: ${occupant?.nickname}`
    : isOccupied
    ? `${occupant?.nickname} さんが作業中`
    : `${config.label} — クリックして着席`

  return (
    <div
      className={`relative flex flex-col items-center gap-0.5 select-none transition-transform duration-150
        ${isClickable ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed'}
      `}
      onClick={isClickable ? onClick : undefined}
      title={titleText}
    >
      {/* 管理者バッジ（上部） */}
      {isAdmin && (
        <span className="text-xs text-gray-300 leading-none font-bold">管理者</span>
      )}

      {/* チェアボックス */}
      <div className={`
        w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-md transition-all duration-200
        ${boxStyle}
        ${pomodoroActive ? 'ring-1 ring-red-500' : ''}
      `}>
        {iconEl}
      </div>

      {/* 着席者情報 */}
      {isOccupied && occupant && (
        <div className="flex flex-col items-center mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nickColor(occupant.nickname) }} />
          <span className="text-xs text-gray-300 max-w-16 truncate leading-tight mt-0.5">
            {occupant.nickname}
          </span>
          <SeatDurationBadge satAt={occupant.satAt} />
          {occupant.pomodoroMode && (
            <span className={`text-xs ${occupant.pomodoroMode === 'work' ? 'text-red-400' : 'text-green-400'}`}>
              {occupant.pomodoroMode === 'work' ? '🍅' : '☕'}
            </span>
          )}
        </div>
      )}

      {/* 空席ラベル */}
      {!isOccupied && (
        <span className="text-xs text-gray-500 leading-none">{config.label}</span>
      )}
    </div>
  )
}
