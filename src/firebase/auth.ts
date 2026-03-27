import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './config'

export async function ensureAnonymousAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (user) {
        resolve(user)
      } else {
        try {
          const cred = await signInAnonymously(auth)
          resolve(cred.user)
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}

export { onAuthStateChanged, auth }
