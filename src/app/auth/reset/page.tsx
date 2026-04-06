'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    if (password.length < 6) { setError('パスワードは6文字以上必要です'); return }
    setLoading(true); setError('')
    const { error } = await supabaseBrowser.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/interview')
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-2xl font-medium text-gray-900 mb-1">
            naitei<span className="text-[#2D5BE3]">.ai</span>
          </div>
          <p className="text-sm text-gray-400">新しいパスワードを設定</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">新しいパスワード</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">パスワード確認</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button
            onClick={handleReset}
            disabled={!password || !confirm || loading}
            className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 rounded-xl transition-colors"
          >
            {loading ? '更新中...' : 'パスワードを更新する →'}
          </button>
        </div>
      </div>
    </main>
  )
}
