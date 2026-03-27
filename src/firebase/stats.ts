import {
  doc, onSnapshot, setDoc, updateDoc, getDoc, arrayUnion,
  increment as fsIncrement,
} from 'firebase/firestore'
import { db } from './config'

export interface RoomStats {
  totalVisitors: number
  totalMinutes: number
  adminUids: string[]
}

const statsRef = () => doc(db, 'config', 'room')

/** リアルタイムで統計を購読 */
export function subscribeToStats(callback: (s: RoomStats) => void): () => void {
  return onSnapshot(
    statsRef(),
    (snap) => {
      if (!snap.exists()) {
        callback({ totalVisitors: 0, totalMinutes: 0, adminUids: [] })
        return
      }
      const d = snap.data()
      callback({
        totalVisitors: d.totalVisitors ?? 0,
        totalMinutes: d.totalMinutes ?? 0,
        adminUids: d.adminUids ?? [],
      })
    },
    () => {
      // 権限エラーなどは無視してデフォルト値を返す
      callback({ totalVisitors: 0, totalMinutes: 0, adminUids: [] })
    },
  )
}

async function ensureStatsDoc(): Promise<void> {
  const snap = await getDoc(statsRef())
  if (!snap.exists()) {
    await setDoc(statsRef(), { totalVisitors: 0, totalMinutes: 0, adminUids: [] })
  }
}

/** 来場者数を1増やす */
export async function incrementVisitorCount(): Promise<void> {
  try {
    await ensureStatsDoc()
    await updateDoc(statsRef(), { totalVisitors: fsIncrement(1) })
  } catch (e) {
    console.error('incrementVisitorCount error:', e)
  }
}

/** 作業時間（分）を累積する */
export async function addStudyMinutes(minutes: number): Promise<void> {
  if (minutes < 1) return
  try {
    await ensureStatsDoc()
    await updateDoc(statsRef(), { totalMinutes: fsIncrement(Math.round(minutes)) })
  } catch (e) {
    console.error('addStudyMinutes error:', e)
  }
}

/** 管理者ロールを取得する（管理者パスワードが一致した場合にUIDを登録） */
export async function claimAdminRole(uid: string, secret: string): Promise<boolean> {
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET
  if (!adminSecret || secret !== adminSecret) return false
  try {
    await ensureStatsDoc()
    await updateDoc(statsRef(), { adminUids: arrayUnion(uid) })
    return true
  } catch (e) {
    console.error('claimAdminRole error:', e)
    return false
  }
}
