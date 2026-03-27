import React from 'react'
import { useAmbientSound, AmbientType } from '../../hooks/useAmbientSound'

const OPTIONS: { type: AmbientType; emoji: string; label: string }[] = [
  { type: 'off',   emoji: '🔇', label: 'なし' },
  { type: 'rain',  emoji: '🌧', label: '雨音' },
  { type: 'cafe',  emoji: '☕', label: 'カフェ' },
  { type: 'white', emoji: '〜', label: 'ノイズ' },
]

export default function AmbientSoundControl() {
  const { type, setType, volume, setVolume } = useAmbientSound()

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-400 flex-none">環境音</span>

      {/* サウンド選択ボタン */}
      <div className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setType(opt.type)}
            title={opt.label}
            className={`px-2 py-0.5 rounded-md text-sm transition-colors ${
              type === opt.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {opt.emoji}
          </button>
        ))}
      </div>

      {/* 音量スライダー（OFF以外で表示） */}
      {type !== 'off' && (
        <input
          type="range"
          min={0}
          max={80}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-16 accent-blue-500"
          title="音量"
        />
      )}
    </div>
  )
}
