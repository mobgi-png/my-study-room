import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, serverTimestamp, Timestamp,
  QuerySnapshot, DocumentData, query, where, getDocs
} from 'firebase/firestore'
import { db } from './config'
import { SeatDoc } from '../types'

const SEATS_COLLECTION = 'seats'

export function subscribeToSeats(
  callback: (seats: Map<string, SeatDoc>) => void
): () => void {
  return onSnapshot(collection(db, SEATS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
    const map = new Map<string, SeatDoc>()
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      map.set(docSnap.id, {
        seatId: docSnap.id,
        roomId: data.roomId ?? 'main',
        occupantUid: data.occupantUid,
        nickname: data.nickname,
        satAt: data.satAt instanceof Timestamp ? data.satAt.toMillis() : (data.satAt ?? Date.now()),
        pomodoroMode: data.pomodoroMode ?? null,
        pomodoroStartedAt: data.pomodoroStartedAt instanceof Timestamp
          ? data.pomodoroStartedAt.toMillis()
          : (data.pomodoroStartedAt ?? null),
      })
    })
    callback(map)
  })
}

export async function claimSeat(
  seatId: string,
  uid: string,
  nickname: string
): Promise<void> {
  await setDoc(doc(db, SEATS_COLLECTION, seatId), {
    seatId,
    roomId: 'main',
    occupantUid: uid,
    nickname,
    satAt: serverTimestamp(),
    pomodoroMode: null,
    pomodoroStartedAt: null,
  })
}

export async function leaveSeat(seatId: string): Promise<void> {
  await deleteDoc(doc(db, SEATS_COLLECTION, seatId))
}

// UID から既存の着席を検索（リロード後の復元用）
export async function findSeatByUid(uid: string): Promise<string | null> {
  const q = query(collection(db, SEATS_COLLECTION), where('occupantUid', '==', uid))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].id
}

// UID の重複着席を全削除（リロード後の新規着席前に呼ぶ）
export async function leaveAllSeatsForUid(uid: string): Promise<void> {
  const q = query(collection(db, SEATS_COLLECTION), where('occupantUid', '==', uid))
  const snapshot = await getDocs(q)
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}

// 着席中のニックネームを更新する
export async function updateSeatNickname(seatId: string, nickname: string): Promise<void> {
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, SEATS_COLLECTION, seatId), { nickname })
}

export async function updatePomodoroState(
  seatId: string,
  mode: 'work' | 'break' | null,
  startedAt: number | null
): Promise<void> {
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, SEATS_COLLECTION, seatId), {
    pomodoroMode: mode,
    pomodoroStartedAt: startedAt ? Timestamp.fromMillis(startedAt) : null,
  })
}
