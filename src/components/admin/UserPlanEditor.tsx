'use client'
import { useState } from 'react'

type User = {
  user_id: string; plan: string
  interviews_used: number; interviews_limit: number; created_at: string
}

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free',        limit: 1    },
  { value: 'pack', label: 'Pack',        limit: 6    },
  { value: 'pro',  label: 'Pro',         limit: 9999 },
  { value: 'vip',  label: 'VIP（手動）',  limit: 99  },
]

const PLAN_COLOR: Record<string, string> = {
  free: 'text-gray-500 bg-gray-50',
  pack: 'text-blue-600 bg-blue-50',
  pro:  'text-yellow-600 bg-yellow-50',
  vip:  'text-purple-600 bg-purple-50',
}

export default function UserPlanEditor({ users: initial }: { users: User[] }) {
  const [users,   setUsers]   = useState<User[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [form,    setForm]    = useState<{ plan: string; limit: number }>({ plan: 'free', limit: 1 })
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ id: string; ok: boolean } | null>(null)

  const startEdit = (u: User) => {
    setEditing(u.user_id)
    setForm({ plan: u.plan, limit: u.interviews_limit })
    setMsg(null)
  }

  const save = async (userId: string) => {
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, plan: form.plan, customLimit: form.limit }),
    })
    const ok = res.ok
    setMsg({ id: userId, ok })
    if (ok) {
      setUsers(prev => prev.map(u =>
        u.user_id === userId
          ? { ...u, plan: form.plan, interviews_limit: form.limit }
          : u
      ))
      setTimeout(() => { setEditing(null); setMsg(null) }, 1000)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <span className="text-sm font-medium text-gray-700">ユーザー · プラン手動調整</span>
      </div>

      {users.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-8">ユーザーなし</p>
      )}

      <div className="divide-y divide-gray-50">
        {users.map(u => (
          <div key={u.user_id} className="px-5 py-3">
            {editing === u.user_id ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    value={form.plan}
                    onChange={e => {
                      const opt = PLAN_OPTIONS.find(o => o.value === e.target.value)
                      setForm({ plan: e.target.value, limit: opt?.limit ?? 1 })
                    }}
                  >
                    {PLAN_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 text-center"
                    value={form.limit}
                    onChange={e => setForm(f => ({ ...f, limit: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => save(u.user_id)}
                    disabled={saving}
                    className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-xl transition-colors disabled:bg-gray-200"
                  >
                    {saving ? '保存中...' : msg?.id === u.user_id && msg.ok ? '✓ 保存済み' : '保存'}
                  </button>
                  <button
                    onClick={() => { setEditing(null); setMsg(null) }}
                    className="flex-1 border border-gray-200 text-gray-500 text-xs font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
                {msg?.id === u.user_id && !msg.ok && (
                  <p className="text-xs text-red-500">保存に失敗しました</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-gray-400">{u.user_id.slice(0, 8)}…</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLOR[u.plan] ?? 'bg-gray-50 text-gray-500'}`}>
                      {u.plan.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {u.interviews_used} / {u.interviews_limit === 9999 ? '∞' : u.interviews_limit} 回使用
                    · {new Date(u.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => startEdit(u)}
                  className="text-xs text-[#2D5BE3] hover:text-blue-700 font-medium transition-colors px-2 py-1"
                >
                  編集
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
