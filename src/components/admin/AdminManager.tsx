'use client'
import { useState, useEffect } from 'react'

type AdminRow = { user_id: string; email: string; created_at: string }

export default function AdminManager() {
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/admins')
    const data = await res.json()
    setAdmins(data.admins ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setMsg(''); setErr('')
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) { setErr(data.error); return }
    setEmail('')
    setMsg(`${data.email} を管理者に追加しました`)
    load()
  }

  const handleRemove = async (userId: string, adminEmail: string) => {
    if (!confirm(`${adminEmail} を管理者から削除しますか？`)) return
    setMsg(''); setErr('')
    const res = await fetch(`/api/admin/admins?user_id=${userId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setErr(data.error); return }
    setMsg(`${adminEmail} を削除しました`)
    load()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">管理者アカウント</h2>

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
              <th className="pb-2 font-medium">メール</th>
              <th className="pb-2 font-medium">追加日</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.user_id} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">{a.email}</td>
                <td className="py-2 text-gray-400">{new Date(a.created_at).toLocaleDateString('ja-JP')}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => handleRemove(a.user_id, a.email)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={3} className="py-3 text-center text-gray-400 text-xs">管理者なし</td></tr>
            )}
          </tbody>
        </table>
      )}

      <div className="flex gap-2 pt-1">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={handleAdd}
          disabled={!email}
          className="bg-[#2D5BE3] text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          追加
        </button>
      </div>

      {msg && <p className="text-xs text-green-600">{msg}</p>}
      {err && <p className="text-xs text-red-500">{err}</p>}
    </div>
  )
}
