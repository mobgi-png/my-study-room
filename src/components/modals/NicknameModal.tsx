import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { containsNgWord } from '../../config/ngwords'

interface NicknameModalProps {
  mode?: 'create' | 'rename'
  onDone: () => void
}

export default function NicknameModal({ mode = 'create', onDone }: NicknameModalProps) {
  const { setNickname, nickname } = useAuth()
  const [input, setInput] = useState(mode === 'rename' ? nickname : '')
  const [error, setError] = useState('')

  const isRename = mode === 'rename'

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
    if (containsNgWord(trimmed)) {
      setError('その名前は使用できません')
      return
    }
    await setNickname(trimmed)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-700">
        {isRename ? (
          <>
            <h2 className="text-xl font-bold text-white mb-2">名前を変更</h2>
            <p className="text-gray-400 text-sm mb-6">
              新しいニックネームを入力してください。
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-2">ようこそ！</h2>
            <p className="text-gray-400 text-sm mb-6">
              自習室で使うニックネームを決めてください。<br />
              メールアドレスや本名は不要です。
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="例: もくもく太郎"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {!isRename && (
            <p className="text-xs text-gray-500">
              ※ メールや個人情報は収集しません。
              <br />
              退席時にデータは自動削除されます。
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isRename ? '変更する' : '入室する 🚪'}
            </button>
            {isRename && (
              <button
                type="button"
                onClick={onDone}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors"
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
