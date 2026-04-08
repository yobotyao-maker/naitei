'use client'
import { useState, useCallback, useEffect } from 'react'

type Session = {
  id: string
  user_id: string
  interview_date: string | null
  interviewer_eid: string | null
  interviewee_eid: string | null
  department: string | null
  selected_domains: string[]
  background_score: number
  technical_score: number
  total_score: number
  p_level: string
  completed_at: string
}

const P_LEVEL_COLOR: Record<string, string> = {
  P1: 'text-gray-500 bg-gray-50',
  P2: 'text-blue-500 bg-blue-50',
  P3: 'text-green-600 bg-green-50',
  P4: 'text-purple-600 bg-purple-50',
}

export default function DesignSessionsSearch() {
  const [rows,    setRows]    = useState<Session[]>([])
  const [total,   setTotal]   = useState<number | null>(null)
  const [page,    setPage]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [detail, setDetail] = useState<Record<string, any> | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    const res  = await fetch(`/api/admin/design-sessions?page=${p}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [])

  useEffect(() => { load(0) }, [load])

  const toggleDetail = async (session: Session) => {
    if (expanded === session.id) {
      setExpanded(null)
      setDetail(null)
      return
    }
    setExpanded(session.id)
    setDetailLoading(true)
    const res  = await fetch(`/api/admin/user-detail/${session.user_id}`)
    const data = await res.json()
    // 該当セッションの answers を取得
    const ds = (data.design_sessions ?? []).find((s: any) => s.id === session.id)
    setDetail(ds ?? null)
    setDetailLoading(false)
  }

  const totalPages = total != null ? Math.ceil(total / 50) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">完了セッション一覧</span>
        <span className="text-xs text-gray-400">
          {total != null ? `${total} 件` : '読み込み中...'}
        </span>
      </div>

      {loading && rows.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-8">読み込み中...</p>
      )}
      {!loading && rows.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-8">セッションなし</p>
      )}

      <div className="divide-y divide-gray-50">
        {rows.map(s => (
          <div key={s.id}>
            {/* ── セッション行 ── */}
            <div
              className="px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleDetail(s)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {s.interviewee_eid && (
                      <span className="text-xs font-medium text-gray-700">{s.interviewee_eid}</span>
                    )}
                    {s.department && (
                      <span className="text-xs text-gray-400">{s.department}</span>
                    )}
                    <span className="text-xs font-mono text-gray-300">{s.user_id.slice(0,8)}…</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(s.selected_domains ?? []).slice(0, 3).map((d: string) => (
                      <span key={d} className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">{d}</span>
                    ))}
                    {(s.selected_domains ?? []).length > 3 && (
                      <span className="text-xs text-gray-400">+{s.selected_domains.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${P_LEVEL_COLOR[s.p_level] ?? 'text-gray-500 bg-gray-50'}`}>
                        {s.p_level}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{s.total_score}</span>
                      <span className="text-xs text-gray-400">/100</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {s.interview_date ?? (s.completed_at ? new Date(s.completed_at).toLocaleDateString('ja-JP') : '-')}
                    </div>
                  </div>
                  {/* PDF ダウンロードボタン */}
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`/admin/design-sessions/${s.id}/report`, '_blank') }}
                    className="text-xs text-[#2D5BE3] hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded-lg transition-colors"
                    title="PDFレポートを開く"
                  >
                    PDF
                  </button>
                  <span className="text-gray-300 text-xs">{expanded === s.id ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {/* ── 展開詳細 ── */}
            {expanded === s.id && (
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
                {detailLoading ? (
                  <p className="text-xs text-gray-400 text-center py-2">読み込み中...</p>
                ) : (
                  <div className="space-y-4">
                    {/* スコアサマリー */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '背景スコア', value: s.background_score },
                        { label: '技術スコア', value: s.technical_score },
                        { label: '合計スコア', value: `${s.total_score}/100` },
                      ].map(k => (
                        <div key={k.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                          <div className="text-lg font-semibold text-gray-900">{k.value}</div>
                          <div className="text-xs text-gray-400">{k.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* 回答リスト */}
                    {detail?.answers && detail.answers.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-2">回答詳細</div>
                        <div className="space-y-2">
                          {detail.answers.map((a: any) => (
                            <div key={a.question_number} className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">Q{a.question_number}</span>
                                <span className="text-xs font-semibold text-blue-600">{a.ai_score}/5</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1 line-clamp-2">{a.user_answer}</p>
                              {a.ai_feedback && (
                                <p className="text-xs text-gray-400 italic">{a.ai_feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 総合フィードバック */}
                    {detail?.overall_feedback && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">総合フィードバック</div>
                        <p className="text-xs text-gray-600 bg-white rounded-xl p-3 border border-gray-100 whitespace-pre-wrap">
                          {detail.overall_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
