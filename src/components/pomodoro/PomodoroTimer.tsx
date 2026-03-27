import React from 'react'
import { usePomodoro } from '../../hooks/usePomodoro'

interface PomodoroTimerProps {
  seatId: string | null
  onComplete?: (nickname: string) => void
}

const CIRCUMFERENCE = 2 * Math.PI * 45 // r=45

export default function PomodoroTimer({ seatId, onComplete }: PomodoroTimerProps) {
  const { state, progress, cycleCount, start, stop, skipBreak, formatTime } = usePomodoro(seatId, onComplete)

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = state === 'work' ? '#EF4444' : state === 'break' ? '#22C55E' : '#4B5563'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring timer */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold text-white">{formatTime()}</span>
          <span className="text-xs text-gray-400">
            {state === 'work' ? '作業中' : state === 'break' ? '休憩中' : 'ポモドーロ'}
          </span>
        </div>
      </div>

      {/* Cycle count */}
      {cycleCount > 0 && (
        <div className="flex gap-1">
          {Array.from({ length: Math.min(cycleCount, 4) }).map((_, i) => (
            <span key={i} className="text-red-400 text-sm">🍅</span>
          ))}
          {cycleCount > 4 && <span className="text-xs text-gray-500">×{cycleCount}</span>}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {state === 'idle' && (
          <button
            onClick={start}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
          >
            開始
          </button>
        )}
        {state === 'work' && (
          <button
            onClick={stop}
            className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
          >
            停止
          </button>
        )}
        {state === 'break' && (
          <>
            <button
              onClick={skipBreak}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
            >
              休憩スキップ
            </button>
            <button
              onClick={stop}
              className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
            >
              終了
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        {state === 'idle' && '25分集中 → 5分休憩'}
        {state === 'work' && '集中モード 🎯'}
        {state === 'break' && '休憩タイム ☕ お疲れ様！'}
      </p>
    </div>
  )
}
