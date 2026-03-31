'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    setLoading(false)
    if (!error) setSent(true)
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-2xl font-medium text-gray-900 mb-1">naitei<span className="text-[#2D5BE3]">.ai</span></div>
          <p className="text-sm text-gray-400">メールでログイン · 内定まで一緒に</p>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-gray-700 font-medium mb-2">メールを送信しました</p>
            <p className="text-sm text-gray-400">{email} のリンクをクリックしてログインしてください</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">メールアドレス</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!email || loading}
              className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              {loading ? '送信中...' : 'マジックリンクを送る →'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              ログインせずに試す
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
