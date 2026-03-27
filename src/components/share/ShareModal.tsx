import React from 'react'

interface ShareModalProps {
  minutes: number
  onClose: () => void
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  if (h > 0 && m > 0) return `${h}時間${m}分`
  if (h > 0) return `${h}時間`
  return `${m}分`
}

export default function ShareModal({ minutes, onClose }: ShareModalProps) {
  const siteUrl = 'https://my-study-room-app.vercel.app'
  const duration = formatDuration(minutes)

  const tweetText = [
    `✏️ ${duration}勉強しました！`,
    `無料のオンライン自習室で一緒に勉強しよう📚`,
    `#もくもく自習室 #勉強垢`,
    siteUrl,
  ].join('\n')

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-7 w-full max-w-sm border border-gray-700 shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-white font-bold text-lg">お疲れさまでした！</h2>
          <p className="text-gray-400 text-sm mt-1">
            今日は <span className="text-white font-bold">{duration}</span> 勉強しました
          </p>
        </div>

        {/* プレビュー */}
        <div className="bg-gray-900 rounded-xl p-4 mb-5 border border-gray-700 text-sm text-gray-300 whitespace-pre-line leading-relaxed">
          {tweetText}
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-xl transition-colors text-center flex items-center justify-center gap-2 border border-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Xでシェアする
          </a>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors text-sm"
          >
            とじる
          </button>
        </div>
      </div>
    </div>
  )
}
