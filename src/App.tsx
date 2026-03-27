import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SeatsProvider } from './contexts/SeatsContext'
import Header from './components/layout/Header'
import FloorPlan from './components/floor/FloorPlan'
import ChatFeed from './components/chat/ChatFeed'
import PomodoroTimer from './components/pomodoro/PomodoroTimer'
import BGMPlayer from './components/bgm/BGMPlayer'
import NicknameModal from './components/modals/NicknameModal'
import { useSeatClaim } from './hooks/useSeatClaim'

const BGM_PLAYLIST_ID = import.meta.env.VITE_BGM_PLAYLIST_ID ?? 'PLxxxxxx'

function Room() {
  const { nickname, loading } = useAuth()
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const { mySeatId, handleSeatClick, leaveCurrentSeat, claiming, error, clearError } = useSeatClaim()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400 text-sm animate-pulse">読み込み中...</div>
      </div>
    )
  }

  if (!nickname) {
    return <NicknameModal onDone={() => setShowNicknameModal(false)} />
  }

  function handleSeatClickWithCheck(seatId: string) {
    if (!nickname) {
      setShowNicknameModal(true)
      return
    }
    handleSeatClick(seatId)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {showNicknameModal && <NicknameModal onDone={() => setShowNicknameModal(false)} />}

      <Header isSeated={!!mySeatId} onLeave={leaveCurrentSeat} />

      {/* エラートースト */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-900/60 border border-red-700 rounded-lg flex items-start justify-between gap-2">
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-400 hover:text-white text-lg leading-none flex-none">×</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main: floor plan */}
        <div className="flex-1 flex flex-col p-4 overflow-auto">
          {/* BGM player */}
          <div className="mb-3 flex justify-between items-center">
            <BGMPlayer playlistId={BGM_PLAYLIST_ID} />
            <div className="text-xs text-gray-500">
              クリックして着席 ・ もう一度クリックで退席
            </div>
          </div>

          <FloorPlan mySeatId={mySeatId} claiming={claiming} onSeatClick={handleSeatClickWithCheck} />

          {/* My seat panel */}
          {mySeatId && (
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">⭐ あなたの席</p>
                  <p className="text-white font-medium">{nickname}</p>
                </div>
                <PomodoroTimer seatId={mySeatId} />
              </div>
            </div>
          )}

          {!mySeatId && (
            <div className="mt-4 text-center text-gray-500 text-sm">
              🪑 空いている席をクリックして着席しましょう！
            </div>
          )}
        </div>

        {/* Sidebar: chat */}
        <div className="w-64 flex-none bg-gray-850 border-l border-gray-700 flex flex-col"
             style={{ backgroundColor: '#111827' }}>
          <ChatFeed />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SeatsProvider>
        <Room />
      </SeatsProvider>
    </AuthProvider>
  )
}
