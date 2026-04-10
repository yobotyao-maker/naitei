'use client'
import { useState, useCallback } from 'react'

type Row = {
  id: string
  session_id: string
  user_id: string
  feedback_text: string | null
  rating: number
  feedback_type: string
  created_at: string
  design_sessions: {
    id: string
    interviewer_eid: string | null
    interviewee_eid: string | null
    department: string | null
    p_level: string | null
  }
}

const FEEDBACK_TYPES = ['建議', '問題', '表賛', 'その他']

export default function FeedbackSearch() {
  const [feedbackType, setFeedbackType] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)

  const search = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (feedbackType) params.set('feedback_type', feedbackType)
    if (minRating > 0) params.set('min_rating', String(minRating))
    params.set('page', String(p))

    const res = await fetch(`/api/admin/feedback?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [feedbackType, minRating])

  const handleDelete = async (id: string) => {
    if (!confirm('このフィードバックを削除しますか？')) return
    await fetch('/api/admin/feedback', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await search(page)
  }

  const totalPages = total != null ? Math.ceil(total / 20) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* フィルター */}
      <div className="p-5 border-b border-gray-50 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-600"
            value={feedbackType}
            onChange={e => setFeedbackType(e.target.value)}
          >
            <option value="">全タイプ</option>
            {FEEDBACK_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-600"
            value={minRating}
            onChange={e => setMinRating(parseInt(e.target.value))}
          >
            <option value="0">全評価</option>
            <option value="1">⭐ 1 以上</option>
            <option value="2">⭐⭐ 2 以上</option>
            <option value="3">⭐⭐⭐ 3 以上</option>
            <option value="4">⭐⭐⭐⭐ 4 以上</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 のみ</option>
          </select>

          <button
            onClick={() => search(0)}
            disabled={loading}
            className="ml-auto bg-[#2D5BE3] hover:bg-blue-700 text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors disabled:bg-gray-200"
          >
            {loading ? '検索中...' : '検索'}
          </button>

          {total != null && (
            <span className="text-xs text-gray-400">{total} 件</span>
          )}
        </div>
      </div>

      {/* リスト */}
      {rows.length === 0 && total != null && (
        <p className="text-xs text-gray-300 text-center py-10">フィードバックがありません</p>
      )}

      <div className="divide-y divide-gray-50">
        {rows.map(r => (
          <div key={r.id} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedRow(r)}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    { '建議': 'bg-blue-50 text-blue-600', '問題': 'bg-red-50 text-red-600', '表賛': 'bg-green-50 text-green-600', 'その他': 'bg-gray-50 text-gray-600' }[r.feedback_type] || 'bg-gray-50 text-gray-600'
                  }`}>
                    {r.feedback_type}
                  </span>
                  <span className="text-xs text-yellow-600">{'⭐'.repeat(r.rating)}</span>
                  {r.design_sessions?.interviewer_eid && (
                    <span className="text-xs text-gray-600 font-mono">👤 {r.design_sessions.interviewer_eid}</span>
                  )}
                </div>
                {r.feedback_text && (
                  <p className="text-sm text-gray-700 line-clamp-2">{r.feedback_text}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
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

      {/* 詳細モーダル */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRow(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">フィードバック詳細</h2>
              <button onClick={() => setSelectedRow(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 情報 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Interviewer EID</p>
                  <p className="font-mono font-medium">{selectedRow.design_sessions?.interviewer_eid || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Interviewee EID</p>
                  <p className="font-mono font-medium">{selectedRow.design_sessions?.interviewee_eid || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">タイプ</p>
                  <p className="font-medium">{selectedRow.feedback_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">評価</p>
                  <p className="text-yellow-600 font-semibold">{'⭐'.repeat(selectedRow.rating)}</p>
                </div>
              </div>

              {/* コメント */}
              {selectedRow.feedback_text && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">コメント</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">{selectedRow.feedback_text}</div>
                </div>
              )}

              {/* 削除ボタン */}
              <button
                onClick={() => {
                  handleDelete(selectedRow.id)
                  setSelectedRow(null)
                }}
                className="w-full text-red-600 hover:bg-red-50 text-sm font-medium py-2 rounded-lg transition-colors border border-red-200"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
