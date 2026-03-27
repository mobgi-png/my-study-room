import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SeatsProvider } from './contexts/SeatsContext'
import { StatsProvider, useStats } from './contexts/StatsContext'
import Header from './components/layout/Header'
import FloorPlan from './components/floor/FloorPlan'
import ChatFeed from './components/chat/ChatFeed'
import PomodoroTimer from './components/pomodoro/PomodoroTimer'
import BGMPlayer from './components/bgm/BGMPlayer'
import NicknameModal from './components/modals/NicknameModal'
import MilestoneOverlay from './components/stats/MilestoneOverlay'
import AdBanner from './components/ads/AdBanner'
import { useSeatClaim } from './hooks/useSeatClaim'

const BGM_PLAYLIST_ID = import.meta.env.VITE_BGM_PLAYLIST_ID ?? 'PLxxxxxx'

function Room() {
  const { nickname, loading } = useAuth()
  const { milestone, clearMilestone } = useStats()
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
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#0F0C08' }}>
      {showNicknameModal && <NicknameModal onDone={() => setShowNicknameModal(false)} />}

      {/* マイルストーン花火 */}
      {milestone && (
        <MilestoneOverlay event={milestone} onDone={clearMilestone} />
      )}

      <Header isSeated={!!mySeatId} onLeave={leaveCurrentSeat} />

      {/* エラートースト */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-900/60 border border-red-700 rounded-lg flex items-start justify-between gap-2">
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-400 hover:text-white text-lg leading-none flex-none">×</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* メイン：フロアマップ */}
        <div className="flex-1 flex flex-col p-4 overflow-auto">
          {/* BGMプレイヤー */}
          <div className="mb-3 flex justify-between items-center">
            <BGMPlayer playlistId={BGM_PLAYLIST_ID} />
            <div className="text-xs" style={{ color: 'rgba(139,99,64,0.6)' }}>
              席をクリックして着席 · もう一度クリックで退室
            </div>
          </div>

          <FloorPlan mySeatId={mySeatId} claiming={claiming} onSeatClick={handleSeatClickWithCheck} />

          {/* 自分の席パネル */}
          {mySeatId && (
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: '#1A1208', border: '1px solid rgba(139,99,64,0.22)' }}>
              <div className="flex items-start gap-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#806850' }}>⭐ あなたの席</p>
                  <p className="font-medium" style={{ color: '#E8DCC8' }}>{nickname}</p>
                </div>
                <PomodoroTimer seatId={mySeatId} />
              </div>
            </div>
          )}

          {!mySeatId && (
            <div className="mt-4 text-center text-gray-500 text-sm">
              空いている席をクリックして着席しましょう！🪑
            </div>
          )}
        </div>

        {/* サイドバー：活動ログ */}
        <div className="w-64 flex-none flex flex-col"
             style={{ backgroundColor: '#110D07', borderLeft: '1px solid rgba(139,99,64,0.18)' }}>
          <ChatFeed />
          {/* Google AdSense（チャット下・集中エリア外） */}
          <AdBanner
            slot={import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR ?? 'YOUR_SLOT_ID'}
            format="rectangle"
            className="border-t border-gray-800 p-1"
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <SeatsProvider>
          <Room />
        </SeatsProvider>
      </StatsProvider>
    </AuthProvider>
  )
}
