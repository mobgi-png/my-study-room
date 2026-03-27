import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { ensureAnonymousAuth, onAuthStateChanged, auth } from '../firebase/auth'
import { loadUserNickname, saveUserNickname } from '../firebase/users'

interface AuthContextValue {
  user: User | null
  nickname: string
  setNickname: (name: string) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  nickname: '',
  setNickname: async () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [nickname, setNicknameState] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const u = await ensureAnonymousAuth()
        if (!mounted) return
        setUser(u)
        let saved = localStorage.getItem('nickname')
        if (!saved) {
          try { saved = await loadUserNickname(u.uid) } catch { /* rules not yet set */ }
        }
        if (saved && mounted) setNicknameState(saved)
      } catch (e: unknown) {
        if (mounted) {
          const msg = e instanceof Error ? e.message : String(e)
          setError(msg)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const unsub = onAuthStateChanged(auth, (u) => {
      if (mounted) setUser(u)
    })

    return () => {
      mounted = false
      unsub()
    }
  }, [])

  async function setNickname(name: string) {
    const trimmed = name.trim().slice(0, 20)
    setNicknameState(trimmed)
    localStorage.setItem('nickname', trimmed)
    if (user) await saveUserNickname(user.uid, trimmed)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 p-6">
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-6 max-w-lg w-full">
          <h2 className="text-red-400 font-bold text-lg mb-2">Firebase 接続エラー</h2>
          <p className="text-gray-300 text-sm mb-4 break-all">{error}</p>
          <div className="text-gray-400 text-sm space-y-1">
            <p>確認してください：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li><code className="text-yellow-400">.env.local</code> の Firebase 設定値が正しいか</li>
              <li>Firebase コンソール → Authentication → <strong className="text-white">匿名</strong> が有効になっているか</li>
              <li>Firestore Database が作成済みか</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, nickname, setNickname, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
