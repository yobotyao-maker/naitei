'use client'
import { useState, useCallback, useEffect } from 'react'

type DesignFeedbackItem = {
  id: string
  session_id: string
  feedback_text: string
  rating: number
  feedback_type: string
  created_at: string
  design_sessions: {
    id: string
    interviewee_eid: string | null
    department: string | null
    p_level: string
    total_score: number
  } | null
}

const FEEDBACK_TYPE_LABEL: Record<string, string> = {
  '建議': '提案',
  '問題': '問題',
  '表賛': '高評価',
  'その他': 'その他',
}

export default function AdminDesignFeedbackPage() {
  const [rows, setRows] = useState<DesignFeedbackItem[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [feedbackType, setFeedbackType] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (feedbackType) params.set('feedback_type', feedbackType)
    params.set('page', String(p))

    const res = await fetch(`/api/admin/design-feedback?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [feedbackType])

  useEffect(() => { load(0) }, [load])

  const totalPages = total != null ? Math.ceil(total / 50) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* フィルター */}
      <div className="px-5 py-4 border-b border-gray-50 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={feedbackType}
            onChange={e => setFeedbackType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white text-gray-600"
          >
            <option value="">すべてのタイプ</option>
            <option value="建議">提案</option>
            <option value="問題">問題</option>
            <option value="表賛">高評価</option>
            <option value="その他">その他</option>
          </select>
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
        <span className="text-sm font-medium text-gray-700">設計コースフィードバック</span>
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
                    {item.design_sessions?.interviewee_eid && (
                      <span className="text-xs font-medium text-gray-700">{item.design_sessions.interviewee_eid}</span>
                    )}
                    {item.design_sessions?.department && (
                      <span className="text-xs text-gray-400">{item.design_sessions.department}</span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.feedback_type === '建議' ? 'bg-blue-50 text-blue-600' :
                      item.feedback_type === '問題' ? 'bg-red-50 text-red-600' :
                      item.feedback_type === '表賛' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {FEEDBACK_TYPE_LABEL[item.feedback_type] ?? item.feedback_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.feedback_text}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-yellow-400">{'★'.repeat(item.rating)}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <span className="text-gray-300 text-xs">{expanded === item.id ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {/* ── 展開詳細 ── */}
            {expanded === item.id && (
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
                <div className="space-y-3">
                  {item.design_sessions && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">セッション情報</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {item.design_sessions.interviewee_eid && (
                          <div className="bg-white rounded p-2 border border-gray-100">
                            <div className="text-gray-400">Interviewee EID</div>
                            <div className="text-gray-700 font-mono">{item.design_sessions.interviewee_eid}</div>
                          </div>
                        )}
                        {item.design_sessions.department && (
                          <div className="bg-white rounded p-2 border border-gray-100">
                            <div className="text-gray-400">部署</div>
                            <div className="text-gray-700">{item.design_sessions.department}</div>
                          </div>
                        )}
                        <div className="bg-white rounded p-2 border border-gray-100">
                          <div className="text-gray-400">Pレベル</div>
                          <div className="text-gray-700 font-semibold">{item.design_sessions.p_level}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-100">
                          <div className="text-gray-400">スコア</div>
                          <div className="text-gray-700 font-semibold">{item.design_sessions.total_score}/80</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">フィードバック情報</div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
                      <div>
                        <span className="text-xs text-gray-400">種別: </span>
                        <span className="text-xs font-medium text-gray-700">
                          {FEEDBACK_TYPE_LABEL[item.feedback_type] ?? item.feedback_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">満足度: </span>
                        <span className="text-sm text-yellow-400">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                        <span className="text-xs text-gray-600 ml-1">({item.rating}/5)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">コメント</div>
                    <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                      {item.feedback_text || '（コメントなし）'}
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
