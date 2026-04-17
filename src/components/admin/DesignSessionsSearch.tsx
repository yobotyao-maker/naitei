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
  status: string
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
  const [selectedAnswer, setSelectedAnswer] = useState<Record<string, any> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  // フィルター状態
  const [eid, setEid] = useState('')
  const [pLevel, setPLevel] = useState('')
  const [status, setStatus] = useState('completed')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (eid) params.set('eid', eid.trim())
    if (pLevel) params.set('p_level', pLevel)
    if (status) params.set('status', status)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    params.set('page', String(p))

    const res  = await fetch(`/api/admin/design-sessions?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [eid, pLevel, status, from, to])

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
    const ds = (data.design_sessions ?? []).find((s: any) => s.id === session.id)
    setDetail(ds ?? null)
    setDetailLoading(false)
  }

  const startEdit = (session: Session) => {
    setEditingId(session.id)
    setEditData({
      interviewee_eid: session.interviewee_eid ?? '',
      p_level: session.p_level,
      department: session.department ?? '',
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      const res = await fetch(`/api/admin/design-sessions/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!res.ok) throw new Error('Update failed')

      setRows(rows.map(r =>
        r.id === editingId
          ? { ...r, ...editData }
          : r
      ))
      setEditingId(null)
    } catch (e) {
      alert('更新に失敗しました: ' + (e as any).message)
    }
  }

  const totalPages = total != null ? Math.ceil(total / 50) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* フィルター */}
      <div className="px-5 py-4 border-b border-gray-50 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="EID 検索"
            value={eid}
            onChange={e => setEid(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 font-mono"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white text-gray-600"
          >
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
          </select>
          <select
            value={pLevel}
            onChange={e => setPLevel(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white text-gray-600"
          >
            <option value="">全 P レベル</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 text-gray-600"
          />
          <span className="text-xs text-gray-300">〜</span>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 text-gray-600"
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
        <span className="text-sm font-medium text-gray-700">セッション一覧</span>
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
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded" title="Interviewee EID">{s.interviewee_eid}</span>
                    )}
                    {s.interviewer_eid && (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded" title="Interviewer EID">👤 {s.interviewer_eid}</span>
                    )}
                    {s.department && (
                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{s.department}</span>
                    )}
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
                {editingId === s.id && (
                  <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">面談対象者 EID</label>
                        <input
                          type="text"
                          value={editData.interviewee_eid}
                          onChange={e => setEditData({ ...editData, interviewee_eid: e.target.value })}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                          placeholder="例: wenxiong.yao"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">P レベル</label>
                        <select
                          value={editData.p_level}
                          onChange={e => setEditData({ ...editData, p_level: e.target.value })}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white"
                        >
                          <option value="P1">P1</option>
                          <option value="P2">P2</option>
                          <option value="P3">P3</option>
                          <option value="P4">P4</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">部署</label>
                        <input
                          type="text"
                          value={editData.department}
                          onChange={e => setEditData({ ...editData, department: e.target.value })}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={saveEdit}
                        className="text-xs bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded transition-colors"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                )}
                {editingId !== s.id && (
                  <button
                    onClick={() => startEdit(s)}
                    className="text-xs text-blue-600 hover:text-blue-700 mb-4 border border-blue-200 hover:border-blue-400 px-3 py-1 rounded transition-colors"
                  >
                    編集
                  </button>
                )}
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
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-blue-600">{a.ai_score}/5</span>
                                  <button
                                    onClick={() => setSelectedAnswer(a)}
                                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                  >
                                    詳細
                                  </button>
                                </div>
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
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">総合フィードバック & スコア分析</div>
                      <div className="space-y-3">
                        {/* スコア分析サマリー */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-600">背景スコア</div>
                              <div className="text-2xl font-bold text-blue-600 mt-1">{s.background_score}</div>
                            </div>
                            <div className="text-center border-l border-r border-blue-300">
                              <div className="text-sm font-medium text-gray-600">技術スコア</div>
                              <div className="text-2xl font-bold text-green-600 mt-1">{s.technical_score}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-600">合計スコア</div>
                              <div className="text-2xl font-bold text-purple-600 mt-1">{s.total_score}</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-blue-300 text-center">
                            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${P_LEVEL_COLOR[s.p_level] ?? 'text-gray-500 bg-gray-50'}`}>
                              {s.p_level}
                            </span>
                          </div>
                        </div>

                        {/* 総合フィードバック */}
                        {detail?.overall_feedback && (
                          <p className="text-xs text-gray-700 bg-white rounded-xl p-4 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                            {detail.overall_feedback}
                          </p>
                        )}
                      </div>
                    </div>
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

      {/* 詳細モーダル */}
      {selectedAnswer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* ヘッダー */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Q{selectedAnswer.question_number} 詳細分析</h3>
                {selectedAnswer.question_category && (
                  <p className="text-xs text-gray-500 mt-1">{selectedAnswer.question_category}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedAnswer(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* スコアサマリー */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">総合スコア</p>
                    <p className="text-4xl font-bold text-blue-600">{selectedAnswer.ai_score}</p>
                    <p className="text-xs text-blue-500 mt-1">/5 点</p>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-blue-200">
                    <span className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{Math.round((selectedAnswer.ai_score / 5) * 100)}</div>
                      <div className="text-xs text-gray-400">%</div>
                    </span>
                  </div>
                </div>
              </div>

              {/* 質問 */}
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">質問</div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedAnswer.question_content || '質問内容なし'}</p>
                </div>
              </div>

              {/* 評価詳細（4次元） */}
              {selectedAnswer.scoring_detail && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">評価詳細</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: '正確性', key: 'accuracy', color: 'blue' },
                      { label: '網羅性', key: 'completeness', color: 'green' },
                      { label: '明瞭性', key: 'clarity', color: 'purple' },
                      { label: '専門用語', key: 'terminology', color: 'orange' },
                    ].map(({ label, key, color }) => {
                      const value = selectedAnswer.scoring_detail[key] || 0
                      const percent = (value / 5) * 100
                      const colorClasses = {
                        blue: 'bg-blue-50 border-blue-200 text-blue-600',
                        green: 'bg-green-50 border-green-200 text-green-600',
                        purple: 'bg-purple-50 border-purple-200 text-purple-600',
                        orange: 'bg-orange-50 border-orange-200 text-orange-600',
                      }
                      const progressColor = {
                        blue: 'bg-blue-500',
                        green: 'bg-green-500',
                        purple: 'bg-purple-500',
                        orange: 'bg-orange-500',
                      }

                      return (
                        <div key={key} className={`rounded-xl p-4 border ${colorClasses[color as keyof typeof colorClasses]}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold">{label}</span>
                            <span className="text-lg font-bold">{value}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${progressColor[color as keyof typeof progressColor]}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ユーザー回答 */}
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">ユーザー回答</div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedAnswer.user_answer || '（回答なし）'}
                  </p>
                </div>
              </div>

              {/* AIフィードバック */}
              {selectedAnswer.ai_feedback && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">AIフィードバック</div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedAnswer.ai_feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
