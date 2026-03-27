import { useState, useEffect, useRef } from 'react'
import { claimSeat, leaveSeat, findSeatByUid, leaveAllSeatsForUid } from '../firebase/seats'
import { incrementVisitorCount, addStudyMinutes } from '../firebase/stats'
import { useAuth } from '../contexts/AuthContext'
import { useSeats } from '../contexts/SeatsContext'

export function useSeatClaim() {
  const { user, nickname } = useAuth()
  const { seats } = useSeats()
  const [mySeatId, setMySeatId] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mySeatIdRef = useRef<string | null>(null)
  const hasCountedVisitRef = useRef(false)

  useEffect(() => {
    mySeatIdRef.current = mySeatId
  }, [mySeatId])

  // マウント時: Firestoreから既存着席を復元
  useEffect(() => {
    if (!user) return
    findSeatByUid(user.uid).then((seatId) => {
      if (seatId) setMySeatId(seatId)
    }).catch(console.error)
  }, [user])

  // ブラウザを閉じる / リロード時に自動退席
  useEffect(() => {
    function handleUnload() {
      const seatId = mySeatIdRef.current
      if (!seatId || !user) return
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/seats/${seatId}`
      const xhr = new XMLHttpRequest()
      xhr.open('DELETE', url, false)
      xhr.send()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [user])

  async function handleSeatClick(seatId: string) {
    if (!user || !nickname || claiming) return
    setError(null)

    // 自分の席をクリック → 退席
    if (mySeatId === seatId) {
      const seat = seats.get(seatId)
      const minutes = seat ? (Date.now() - seat.satAt) / 60000 : 0
      try {
        await leaveSeat(seatId)
        if (minutes >= 1) addStudyMinutes(minutes)
      } catch (e) {
        console.error(e)
      }
      setMySeatId(null)
      return
    }

    // 別の席へ移動する場合、現在の着席時間を記録してから退席
    if (mySeatId) {
      const seat = seats.get(mySeatId)
      const minutes = seat ? (Date.now() - seat.satAt) / 60000 : 0
      try {
        await leaveSeat(mySeatId)
        if (minutes >= 1) addStudyMinutes(minutes)
      } catch { /* ignore */ }
      setMySeatId(null)
    }

    // 楽観的UI更新
    setMySeatId(seatId)
    setClaiming(true)

    try {
      await leaveAllSeatsForUid(user.uid)
      await claimSeat(seatId, user.uid, nickname)

      // 初回着席のみ来場者数をカウント
      if (!hasCountedVisitRef.current) {
        hasCountedVisitRef.current = true
        incrementVisitorCount()
      }
    } catch (e: unknown) {
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
    const seat = seats.get(mySeatId)
    const minutes = seat ? (Date.now() - seat.satAt) / 60000 : 0
    try {
      await leaveSeat(mySeatId)
      if (minutes >= 1) addStudyMinutes(minutes)
    } catch (e) {
      console.error(e)
    }
    setMySeatId(null)
  }

  return { mySeatId, handleSeatClick, leaveCurrentSeat, claiming, error, clearError: () => setError(null) }
}
