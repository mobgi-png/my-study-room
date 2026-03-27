import React, { useRef, useState } from 'react'
import { useSeats } from '../../contexts/SeatsContext'
import { useStats } from '../../contexts/StatsContext'
import { useAuth } from '../../contexts/AuthContext'
import { claimAdminRole } from '../../firebase/stats'

interface HeaderProps {
  onLeave?: () => void
  isSeated: boolean
}

export default function Header({ onLeave, isSeated }: HeaderProps) {
  const { onlineCount } = useSeats()
  const { stats } = useStats()
  const { user } = useAuth()
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminInput, setAdminInput] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalHours = Math.floor(stats.totalMinutes / 60)
  const isAdmin = !!user && stats.adminUids.includes(user.uid)

  // タイトルを5回素早くクリックすると管理者モーダルを開く
  function handleTitleClick() {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0 }, 2000)
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0
      setAdminInput('')
      setAdminMsg('')
      setShowAdminModal(true)
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const ok = await claimAdminRole(user.uid, adminInput)
    if (ok) {
      setAdminMsg('✅ 管理者として登録されました！')
      setTimeout(() => setShowAdminModal(false), 1500)
    } else {
      setAdminMsg('❌ パスワードが違います')
    }
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          {/* タイトル（5回クリックで管理者認証） */}
          <span
            className="text-lg font-bold text-white cursor-default select-none"
            onClick={handleTitleClick}
          >
            📚 もくもく自習室
            {isAdmin && <span className="ml-1.5 text-sm font-bold text-white">も</span>}
          </span>

          {/* 在室数 */}
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
            🟢 {onlineCount}人在室
          </span>

          {/* 累計統計 */}
          <span className="text-xs text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-full">
            👥 累計 {stats.totalVisitors.toLocaleString()}人
          </span>
          <span className="text-xs text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-full">
            ⏳ 累計 {totalHours.toLocaleString()}時間
          </span>
        </div>

        {isSeated && (
          <button
            onClick={onLeave}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors flex-none ml-2"
          >
            退室する
          </button>
        )}
      </header>

      {/* 管理者認証モーダル */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-7 w-full max-w-xs border border-purple-700 shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-1">🔐 管理者認証（も）</h2>
            <p className="text-gray-400 text-xs mb-4">
              管理者パスワードを入力してください。<br />
              認証後、あなたの席に王冠マークが表示されます。
            </p>
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="管理者パスワード"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
              {adminMsg && (
                <p className="text-sm">{adminMsg}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!adminInput}
                  className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  認証する
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
