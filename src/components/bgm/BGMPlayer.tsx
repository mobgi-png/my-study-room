import React, { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  nextVideo(): void
  setVolume(v: number): void
  getPlayerState(): number
  destroy(): void
}

interface BGMPlayerProps {
  playlistId: string
}

export default function BGMPlayer({ playlistId }: BGMPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(30)
  const [apiReady, setApiReady] = useState(false)

  useEffect(() => {
    if (window.YT?.Player) {
      setApiReady(true)
      return
    }

    window.onYouTubeIframeAPIReady = () => setApiReady(true)

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!apiReady || !containerRef.current) return

    const el = document.createElement('div')
    containerRef.current.appendChild(el)

    playerRef.current = new window.YT.Player(el, {
      height: '0',
      width: '0',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        autoplay: 0,
        controls: 0,
        origin: window.location.origin,
        host: 'https://www.youtube-nocookie.com',
      },
      events: {
        onStateChange: (e: { data: number }) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING)
        },
      },
    })

    return () => {
      playerRef.current?.destroy()
    }
  }, [apiReady, playlistId])

  useEffect(() => {
    playerRef.current?.setVolume(volume)
  }, [volume])

  function togglePlay() {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  function handleNext() {
    playerRef.current?.nextVideo()
  }

  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#1E1408', border: '1px solid rgba(139,99,64,0.22)' }}>
      <span className="text-xs" style={{ color: 'rgba(139,99,64,0.7)' }}>🎵 BGM</span>
      <div ref={containerRef} className="hidden" />
      <button
        onClick={togglePlay}
        className="transition-colors text-sm hover:text-yellow-400"
        style={{ color: '#C8A87A' }}
        title={isPlaying ? '一時停止' : '再生'}
      >
        {isPlaying ? '⏸' : '▶️'}
      </button>
      <button
        onClick={handleNext}
        className="transition-colors text-sm hover:text-yellow-200"
        style={{ color: 'rgba(139,99,64,0.6)' }}
        title="次の曲"
      >
        ⏭
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-16 accent-red-500"
        title="音量"
      />
      <span className="text-xs text-gray-500">{volume}%</span>
    </div>
  )
}
