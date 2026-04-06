'use client'
import { useEffect, useState, useCallback } from 'react'

type AuthUser = { id: string; email: string; created_at: string; last_sign_in_at: string | null }

export default function UserManager() {
  const [users,        setUsers]        = useState<AuthUser[]>([])
  const [loading,      setLoading]      = useState(false)
  const [newEmail,     setNewEmail]     = useState('')
  const [newPassword,  setNewPassword]  = useState('')
  const [creating,     setCreating]     = useState(false)
  const [createError,  setCreateError]  = useState('')
  const [resetTarget,  setResetTarget]  = useState<AuthUser | null>(null)
  const [resetPw,      setResetPw]      = useState('')
  const [resetError,   setResetError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!newEmail || !newPassword) return
    setCreating(true); setCreateError('')
    const res  = await fetch('/api/admin/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: newEmail, password: newPassword }),
    })
    const data = await res.json()
    if (data.error) { setCreateError(data.error); setCreating(false); return }
    setNewEmail(''); setNewPassword('')
    setCreating(false)
    load()
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`${email} を削除しますか？`)) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    load()
  }

  const handleResetPassword = async () => {
    if (!resetTarget || !resetPw) return
    setResetError('')
    const res  = await fetch('/api/admin/users', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: resetTarget.id, password: resetPw }),
    })
    const data = await res.json()
    if (data.error) { setResetError(data.error); return }
    setResetTarget(null); setResetPw('')
  }

  return (
    <>
      {/* 新建用户 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="text-sm font-medium text-gray-700 mb-4">新規ユーザー作成</div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="email"
            placeholder="メールアドレス"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="flex-1 min-w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="flex-1 min-w-36 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleCreate}
            disabled={!newEmail || !newPassword || creating}
            className="bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
          >
            {creating ? '作成中...' : '作成'}
          </button>
        </div>
        {createError && <p className="text-xs text-red-500 mt-2">{createError}</p>}
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">ユーザー一覧</span>
          <span className="text-xs text-gray-400">{loading ? '読み込み中...' : `${users.length} 人`}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {!loading && users.length === 0 && (
            <p className="text-xs text-gray-300 text-center py-8">ユーザーなし</p>
          )}
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3 gap-3">
              <div className="min-w-0">
                <div className="text-sm text-gray-700 truncate">{u.email}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  登録: {new Date(u.created_at).toLocaleDateString('ja-JP')}
                  {u.last_sign_in_at && (
                    <> · 最終: {new Date(u.last_sign_in_at).toLocaleDateString('ja-JP')}</>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setResetTarget(u); setResetPw(''); setResetError('') }}
                  className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
                >
                  PW変更
                </button>
                <button
                  onClick={() => handleDelete(u.id, u.email)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg border border-red-200 hover:border-red-400 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* パスワード変更モーダル */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-sm font-medium text-gray-900 mb-1">パスワード変更</div>
            <div className="text-xs text-gray-400 mb-4 truncate">{resetTarget.email}</div>
            <input
              type="password"
              placeholder="新しいパスワード"
              value={resetPw}
              onChange={e => setResetPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 mb-3"
            />
            {resetError && <p className="text-xs text-red-500 mb-3">{resetError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setResetTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!resetPw}
                className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                変更する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
