import React, { useState } from 'react'
import { usePomodoro, PomodoroSettings } from '../../hooks/usePomodoro'

interface PomodoroTimerProps {
  seatId: string | null
  onComplete?: (nickname: string) => void
}

const CIRCUMFERENCE = 2 * Math.PI * 45 // r=45

const WORK_OPTIONS = [25, 50, 55] as const
const BREAK_OPTIONS = [5, 10] as const
const MAX_CYCLES_OPTIONS = [
  { label: '∞', value: 0 },
  { label: '1回', value: 1 },
  { label: '2回', value: 2 },
  { label: '3回', value: 3 },
  { label: '4回', value: 4 },
]

export default function PomodoroTimer({ seatId, onComplete }: PomodoroTimerProps) {
  const [settings, setSettings] = useState<PomodoroSettings>({ workMin: 25, breakMin: 5, maxCycles: 0 })
  const [showSettings, setShowSettings] = useState(false)

  const { state, progress, cycleCount, start, stop, skipBreak, formatTime } = usePomodoro(seatId, settings, onComplete)

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = state === 'work' ? '#EF4444' : state === 'break' ? '#22C55E' : '#4B5563'

  const maxLabel = settings.maxCycles === 0 ? '∞' : `${settings.maxCycles}回`

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring timer */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold text-white">{formatTime()}</span>
          <span className="text-xs text-gray-400">
            {state === 'work' ? '作業中' : state === 'break' ? '休憩中' : 'ポモドーロ'}
          </span>
        </div>
      </div>

      {/* Cycle count */}
      {cycleCount > 0 && (
        <div className="flex gap-1 items-center">
          {Array.from({ length: Math.min(cycleCount, 4) }).map((_, i) => (
            <span key={i} className="text-red-400 text-sm">🍅</span>
          ))}
          {cycleCount > 4 && <span className="text-xs text-gray-500">×{cycleCount}</span>}
          {settings.maxCycles > 0 && (
            <span className="text-xs text-gray-500 ml-1">/ {settings.maxCycles}</span>
          )}
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

      {/* Settings toggle (idle only) */}
      {state === 'idle' && (
        <button
          onClick={() => setShowSettings(v => !v)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showSettings ? '▲ 設定を閉じる' : '⚙ 設定'}
        </button>
      )}

      {/* Settings panel */}
      {state === 'idle' && showSettings && (
        <div className="w-full bg-gray-800 rounded-xl p-3 flex flex-col gap-3 text-xs">
          {/* Work time */}
          <div>
            <p className="text-gray-400 mb-1">作業時間</p>
            <div className="flex gap-1">
              {WORK_OPTIONS.map(min => (
                <button
                  key={min}
                  onClick={() => setSettings(s => ({ ...s, workMin: min }))}
                  className={`flex-1 py-1 rounded-lg transition-colors ${
                    settings.workMin === min
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {min}分
                </button>
              ))}
            </div>
          </div>

          {/* Break time */}
          <div>
            <p className="text-gray-400 mb-1">休憩時間</p>
            <div className="flex gap-1">
              {BREAK_OPTIONS.map(min => (
                <button
                  key={min}
                  onClick={() => setSettings(s => ({ ...s, breakMin: min }))}
                  className={`flex-1 py-1 rounded-lg transition-colors ${
                    settings.breakMin === min
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {min}分
                </button>
              ))}
            </div>
          </div>

          {/* Max cycles */}
          <div>
            <p className="text-gray-400 mb-1">セット数上限</p>
            <div className="flex gap-1 flex-wrap">
              {MAX_CYCLES_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setSettings(s => ({ ...s, maxCycles: value }))}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    settings.maxCycles === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        {state === 'idle' && `${settings.workMin}分集中 → ${settings.breakMin}分休憩 × ${maxLabel}`}
        {state === 'work' && '集中モード 🎯'}
        {state === 'break' && '休憩タイム ☕ お疲れ様！'}
      </p>
    </div>
  )
}
