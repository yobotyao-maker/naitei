'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Logo from '@/components/Logo'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type Mode = 'signin' | 'signup' | 'forgot'

function AuthPageContent() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/course-select'

  const switchMode = (m: Mode) => { setMode(m); setError(''); setResetSent(false) }

  const handleSubmit = async () => {
    if (mode === 'forgot') {
      if (!email) return
      setLoading(true); setError('')
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/reset`,
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setResetSent(true)
      return
    }

    if (!email || !password) return
    setLoading(true); setError('')

    if (mode === 'signin') {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      const res = await fetch('/api/me')
      const me = await res.json()
      router.push(me.isAdmin ? '/admin' : redirect)
    } else {
      const { error } = await supabaseBrowser.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push(redirect)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8 gap-2">
          <Logo size="lg" href="/" />
          <p className="text-sm text-gray-400">AIで内定を掴もう</p>
        </div>

        {/* 忘记密码成功提示 */}
        {resetSent ? (
          <div className="text-center py-2">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-gray-700 font-medium mb-2">再設定メールを送信しました</p>
            <p className="text-sm text-gray-400 mb-6">{email} のリンクからパスワードを再設定してください</p>
            <button onClick={() => switchMode('signin')} className="text-sm text-blue-500 hover:text-blue-700">
              ログイン画面に戻る
            </button>
          </div>
        ) : mode === 'forgot' ? (
          /* 忘记密码表单 */
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">登録済みのメールアドレス</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!email || loading}
              className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              {loading ? '送信中...' : '再設定メールを送る →'}
            </button>
            <button onClick={() => switchMode('signin')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
              ← ログインに戻る
            </button>
          </div>
        ) : (
          /* 登录 / 注册表单 */
          <>
            <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
              {(['signin', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors
                    ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {m === 'signin' ? 'ログイン' : '新規登録'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-600">パスワード</label>
                  {mode === 'signin' && (
                    <button onClick={() => switchMode('forgot')} className="text-xs text-blue-400 hover:text-blue-600 transition-colors">
                      パスワードを忘れた？
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!email || !password || loading}
                className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 rounded-xl transition-colors"
              >
                {loading ? '処理中...' : (mode === 'signin' ? 'ログイン →' : 'アカウント作成 →')}
              </button>
              <button onClick={() => router.push('/')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
                ログインせずに試す
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  )
}
