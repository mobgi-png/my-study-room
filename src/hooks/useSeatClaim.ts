import { useState } from 'react'
import { claimSeat, leaveSeat } from '../firebase/seats'
import { useAuth } from '../contexts/AuthContext'

export function useSeatClaim() {
  const { user, nickname } = useAuth()
  const [mySeatId, setMySeatId] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSeatClick(seatId: string) {
    if (!user || !nickname || claiming) return
    setError(null)

    // 自分の席をクリック → 退席
    if (mySeatId === seatId) {
      try {
        await leaveSeat(seatId)
      } catch (e) {
        console.error(e)
      }
      setMySeatId(null)
      return
    }

    // 他の席に移動する場合、先に退席
    if (mySeatId) {
      try { await leaveSeat(mySeatId) } catch { /* ignore */ }
      setMySeatId(null)
    }

    // 楽観的UI更新（先に見た目を更新）
    setMySeatId(seatId)
    setClaiming(true)

    try {
      await claimSeat(seatId, user.uid, nickname)
    } catch (e: unknown) {
      // 失敗したらロールバック
      setMySeatId(null)
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('permission') || msg.includes('insufficient')) {
        setError('Firestoreのルール設定が必要です。Firebaseコンソール → Firestore → ルール を確認してください。')
      } else {
        setError(`着席エラー: ${msg}`)
      }
    } finally {
      setClaiming(false)
    }
  }

  async function leaveCurrentSeat() {
    if (!mySeatId) return
    try {
      await leaveSeat(mySeatId)
    } catch (e) {
      console.error(e)
    }
    setMySeatId(null)
  }

  return { mySeatId, handleSeatClick, leaveCurrentSeat, claiming, error, clearError: () => setError(null) }
}
