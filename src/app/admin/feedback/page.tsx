'use client'
import { useState, useCallback, useEffect } from 'react'

type FeedbackItem = {
  id: string
  email: string
  name: string | null
  eid: string | null
  message: string
  created_at: string
}

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [eid, setEid] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (email) params.set('email', email.trim())
    if (eid) params.set('eid', eid.trim())
    params.set('page', String(p))

    const res = await fetch(`/api/admin/feedback?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [email, eid])

  useEffect(() => { load(0) }, [load])

  const totalPages = total != null ? Math.ceil(total / 50) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* フィルター */}
      <div className="px-5 py-4 border-b border-gray-50 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input
            type="email"
            placeholder="メールアドレス検索"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 font-mono"
          />
          <input
            type="text"
            placeholder="EID 検索"
            value={eid}
            onChange={e => setEid(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 font-mono"
          />
          <button
            onClick={() => load(0)}
            disabled={loading}
            className="ml-auto bg-[#2D5BE3] hover:bg-blue-700 text-white text-xs font-medium px-5 py-1.5 rounded-lg transition-colors disabled:bg-gray-200"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </div>
      </div>

      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">フィードバック一覧</span>
        <span className="text-xs text-gray-400">
          {total != null ? `${total} 件` : '読み込み中...'}
        </span>
      </div>

      {loading && rows.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-8">読み込み中...</p>
      )}
      {!loading && rows.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-8">フィードバックなし</p>
      )}

      <div className="divide-y divide-gray-50">
        {rows.map(item => (
          <div key={item.id}>
            {/* ── フィードバック行 ── */}
            <div
              className="px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-medium text-gray-700">{item.email}</span>
                    {item.name && (
                      <span className="text-xs text-gray-400">{item.name}</span>
                    )}
                    {item.eid && (
                      <span className="text-xs font-mono text-gray-300">{item.eid}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.message}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('ja-JP')}
                  </div>
                  <span className="text-gray-300 text-xs">{expanded === item.id ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {/* ── 展開詳細 ── */}
            {expanded === item.id && (
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
                <div className="space-y-3">
                  {item.email && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">メールアドレス</div>
                      <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 font-mono">
                        {item.email}
                      </div>
                    </div>
                  )}

                  {item.name && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">お名前</div>
                      <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                        {item.name}
                      </div>
                    </div>
                  )}

                  {item.eid && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">EID</div>
                      <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 font-mono">
                        {item.eid}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">フィードバック内容</div>
                    <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">送信日時</div>
                    <div className="text-xs text-gray-600">
                      {new Date(item.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 0 || loading}
            className="text-xs text-gray-500 disabled:text-gray-300 hover:text-gray-700 transition-colors"
          >
            ← 前へ
          </button>
          <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
          <button
            onClick={() => load(page + 1)}
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
