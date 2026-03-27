import { useState, useEffect, useRef } from 'react'
import { claimSeat, leaveSeat, findSeatByUid, leaveAllSeatsForUid } from '../firebase/seats'
import { useAuth } from '../contexts/AuthContext'

export function useSeatClaim() {
  const { user, nickname } = useAuth()
  const [mySeatId, setMySeatId] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mySeatIdRef = useRef<string | null>(null)

  // mySeatIdRef を常に最新の mySeatId と同期
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
      if (!seatId) return
      // sendBeacon はここでは使えないので navigator.sendBeacon を使うか、
      // fetch keepalive で deleteDoc を代替する手段がないため
      // Firestoreの onDisconnect 相当がないWebSDKでは leaveSeat を同期的に呼ぶ
      // 実用上は beforeunload 内で fetch keepalive を使う
      const uid = user?.uid
      if (!uid) return
      // keepalive fetch で Cloud Functions を呼ぶ代わりに、
      // ここでは同期的に XMLHttpRequest を使って Firestore REST API を叩く
      // ただし Firebase REST APIはシンプルなので deleteDoc をXHRで実行
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/seats/${seatId}`
      const xhr = new XMLHttpRequest()
      xhr.open('DELETE', url, false) // 同期リクエスト
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
      try {
        await leaveSeat(seatId)
      } catch (e) {
        console.error(e)
      }
      setMySeatId(null)
      return
    }

    // 楽観的UI更新（先に見た目を更新）
    const prevSeatId = mySeatId
    setMySeatId(seatId)
    setClaiming(true)

    try {
      // Firestore上の重複着席を全削除してから新規着席
      await leaveAllSeatsForUid(user.uid)
      await claimSeat(seatId, user.uid, nickname)
    } catch (e: unknown) {
      // 失敗したらロールバック
      setMySeatId(prevSeatId)
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
