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
  // モバイル用タブ: 'floor' | 'chat'
  const [mobileTab, setMobileTab] = useState<'floor' | 'chat'>('floor')
  const [showRenameModal, setShowRenameModal] = useState(false)

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
      {showRenameModal && <NicknameModal mode="rename" onDone={() => setShowRenameModal(false)} />}

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

      {/* モバイル用タブバー（md以上では非表示） */}
      <div className="flex md:hidden border-b border-gray-700 flex-none">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mobileTab === 'floor'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setMobileTab('floor')}
        >
          🪑 フロアマップ
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mobileTab === 'chat'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setMobileTab('chat')}
        >
          💬 活動ログ
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* メイン：フロアマップ（モバイルではタブ選択時のみ表示） */}
        <div className={`
          flex-1 flex flex-col p-4 overflow-auto
          ${mobileTab === 'chat' ? 'hidden md:flex' : 'flex'}
        `}>
          {/* BGMプレイヤー */}
          <div className="mb-3 flex justify-between items-center">
            <BGMPlayer playlistId={BGM_PLAYLIST_ID} />
            <div className="text-xs text-gray-500 hidden sm:block">
              席をクリックして着席 · もう一度クリックで退室
            </div>
          </div>

          <FloorPlan mySeatId={mySeatId} claiming={claiming} onSeatClick={handleSeatClickWithCheck} />

          {/* 自分の席パネル */}
          {mySeatId && (
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">⭐ あなたの席</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{nickname}</p>
                    <button
                      onClick={() => setShowRenameModal(true)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      title="名前を変更"
                    >
                      ✏️ 名前を変える
                    </button>
                  </div>
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

        {/* サイドバー：活動ログ（モバイルではタブ選択時のみ表示） */}
        <div
          className={`
            flex-none border-gray-700 flex flex-col
            w-full md:w-64 md:border-l
            ${mobileTab === 'floor' ? 'hidden md:flex' : 'flex'}
          `}
          style={{ backgroundColor: '#111827' }}
        >
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
