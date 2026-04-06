'use client'
import { useState, useCallback } from 'react'

type Row = {
  id: string; job_role: string; score: number
  level: string; feedback: string; created_at: string
}

const LEVELS = ['', 'S1', 'S2', 'S3', 'S4']
const LEVEL_COLOR: Record<string, string> = {
  S1: 'text-red-500 bg-red-50',
  S2: 'text-orange-400 bg-orange-50',
  S3: 'text-blue-500 bg-blue-50',
  S4: 'text-yellow-500 bg-yellow-50',
}

export default function InterviewSearch() {
  const [keyword, setKeyword] = useState('')
  const [level,   setLevel]   = useState('')
  const [from,    setFrom]    = useState('')
  const [to,      setTo]      = useState('')
  const [page,    setPage]    = useState(0)
  const [rows,    setRows]    = useState<Row[]>([])
  const [total,   setTotal]   = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (level)   params.set('level',   level)
    if (from)    params.set('from',    from)
    if (to)      params.set('to',      to)
    params.set('page', String(p))

    const res  = await fetch(`/api/admin/interviews?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [keyword, level, from, to])

  const totalPages = total != null ? Math.ceil(total / 20) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* 搜索栏 */}
      <div className="p-5 border-b border-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 col-span-2 sm:col-span-1"
            placeholder="岗位キーワード..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(0)}
          />
          <select
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            value={level}
            onChange={e => setLevel(e.target.value)}
          >
            {LEVELS.map(l => (
              <option key={l} value={l}>{l || '全レベル'}</option>
            ))}
          </select>
          <input
            type="date"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => search(0)}
            disabled={loading}
            className="bg-[#2D5BE3] hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors disabled:bg-gray-200"
          >
            {loading ? '検索中...' : '検索'}
          </button>
          {total != null && (
            <span className="text-xs text-gray-400">{total} 件</span>
          )}
        </div>
      </div>

      {/* 结果列表 */}
      {rows.length === 0 && total != null && (
        <p className="text-xs text-gray-300 text-center py-8">条件に一致する記録がありません</p>
      )}
      {rows.length === 0 && total == null && (
        <p className="text-xs text-gray-300 text-center py-8">上の条件を入力して検索してください</p>
      )}
      <div className="divide-y divide-gray-50">
        {rows.map(r => (
          <div key={r.id} className="px-5 py-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">{r.job_role}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLOR[r.level] ?? 'bg-gray-50 text-gray-500'}`}>
                  {r.level}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{r.score?.toFixed(1)}</span>
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('ja-JP', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            {r.feedback && (
              <p className="text-xs text-gray-400 truncate">{r.feedback}</p>
            )}
          </div>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
          <button
            onClick={() => search(page - 1)}
            disabled={page === 0 || loading}
            className="text-xs text-gray-500 disabled:text-gray-300 hover:text-gray-700 transition-colors"
          >
            ← 前へ
          </button>
          <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
          <button
            onClick={() => search(page + 1)}
            disabled={page >= totalPages - 1 || loading}
            className="text-xs text-gray-500 disabled:text-gray-300 hover:text-gray-700 transition-colors"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  )
}
