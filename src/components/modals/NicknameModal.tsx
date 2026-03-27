import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface NicknameModalProps {
  onDone: () => void
}

export default function NicknameModal({ onDone }: NicknameModalProps) {
  const { setNickname } = useAuth()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed.length < 1) {
      setError('ニックネームを入力してください')
      return
    }
    if (trimmed.length > 20) {
      setError('20文字以内で入力してください')
      return
    }
    await setNickname(trimmed)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">ようこそ！</h2>
        <p className="text-gray-400 text-sm mb-6">
          自習室で使うニックネームを決めてください。<br />
          メールアドレスや本名は不要です。
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="例: もくもく太郎"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-red-500 focus:outline-none placeholder-gray-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-xs text-gray-500">
            ※ メールや個人情報は収集しません。
            <br />
            退席時にデータは自動削除されます。
          </p>
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            入室する 🚪
          </button>
        </form>
      </div>
    </div>
  )
}
