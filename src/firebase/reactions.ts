import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from './config'

export interface ReactionDoc {
  id: string
  fromNickname: string
  toNickname: string
  emoji: string
  timestamp: number
}

export async function sendReaction(fromNickname: string, toNickname: string, emoji: string) {
  await addDoc(collection(db, 'reactions'), {
    fromNickname,
    toNickname,
    emoji,
    timestamp: Date.now(),
  })
}

export function subscribeToRecentReactions(callback: (reactions: ReactionDoc[]) => void) {
  // 直近1時間のリアクションのみ購読
  const since = Date.now() - 60 * 60 * 1000
  const q = query(
    collection(db, 'reactions'),
    where('timestamp', '>', since),
    orderBy('timestamp', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReactionDoc)))
  }, () => {
    // インデックスが未作成の場合でも落ちないようにする
    callback([])
  })
}
