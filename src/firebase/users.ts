import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './config'
import { UserDoc } from '../types'

export async function saveUserNickname(uid: string, nickname: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    nickname,
    lastSeen: Date.now(),
  })
}

export async function loadUserNickname(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) {
    return (snap.data() as UserDoc).nickname
  }
  return null
}
