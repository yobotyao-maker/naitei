'use client'
import { useState, useCallback } from 'react'

type Row = {
  id: string; user_id: string; eid: string | null; interviewer_eid: string | null; job_role: string; score: number
  level: string; feedback: string; lang: string | null
  technical_score: number | null; expression_score: number | null
  logic_score: number | null; japanese_score: number | null
  created_at: string
  question?: string; answer?: string; experience?: string
  _design_answers?: Array<{id: string; question_number: number; user_answer: string; ai_score: number; ai_feedback: string}>
  _interview_date?: string
}

const LEVELS = ['', 'P1', 'P2', 'P3', 'P4']
const LEVEL_COLOR: Record<string, string> = {
  P1: 'text-red-500 bg-red-50',
  P2: 'text-orange-400 bg-orange-50',
  P3: 'text-blue-500 bg-blue-50',
  P4: 'text-green-500 bg-green-50',
}

export default function InterviewSearch() {
  const [eid,     setEid]     = useState('')
  const [level,   setLevel]   = useState('')
  const [from,    setFrom]    = useState('')
  const [to,      setTo]      = useState('')
  const [page,    setPage]    = useState(0)
  const [rows,    setRows]    = useState<Row[]>([])
  const [total,   setTotal]   = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)

  const search = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (eid)   params.set('eid',   eid.trim())
    if (level) params.set('level', level)
    if (from)  params.set('from',  from)
    if (to)    params.set('to',    to)
    params.set('page', String(p))

    const res  = await fetch(`/api/admin/interviews?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [eid, level, from, to])

  const totalPages = total != null ? Math.ceil(total / 20) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* 検索バー */}
      <div className="p-5 border-b border-gray-50 space-y-3">
        {/* EID 主検索 */}
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 font-mono"
            placeholder="EID 検索（受験者・面接官どちらでも可）"
            value={eid}
            onChange={e => setEid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search(0)}
          />
          <button
            onClick={() => search(0)}
            disabled={loading}
            className="bg-[#2D5BE3] hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:bg-gray-200 shrink-0"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </div>
        {/* サブフィルター */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white text-gray-600"
            value={level}
            onChange={e => setLevel(e.target.value)}
          >
            {LEVELS.map(l => (
              <option key={l} value={l}>{l || '全レベル'}</option>
            ))}
          </select>
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 text-gray-600"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
          <span className="text-xs text-gray-300">〜</span>
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 text-gray-600"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
          {total != null && (
            <span className="text-xs text-gray-400 ml-auto">{total} 件</span>
          )}
        </div>
      </div>

      {/* 結果一覧 */}
      {rows.length === 0 && total != null && (
        <p className="text-xs text-gray-300 text-center py-10">条件に一致する記録がありません</p>
      )}
      {rows.length === 0 && total == null && (
        <p className="text-xs text-gray-300 text-center py-10">EID を入力するか、空欄のまま検索で全件表示</p>
      )}

      <div className="divide-y divide-gray-50">
        {rows.map(r => (
          <div
            key={r.id}
            onClick={() => setSelectedRow(r)}
            className="px-5 py-4 cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* ヘッダー行 */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {r.eid ? (
                    <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded" title="Interviewee EID">{r.eid}</span>
                  ) : (
                    <span className="text-xs text-gray-300 font-mono">受験者EIDなし</span>
                  )}
                  {r.interviewer_eid && (
                    <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded" title="Interviewer EID">👤 {r.interviewer_eid}</span>
                  )}
                  <span className="text-sm font-medium text-gray-800">{r.job_role}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLOR[r.level] ?? 'bg-gray-50 text-gray-500'}`}>
                    {r.level}
                  </span>
                  {r.lang === 'ja' && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">日本語</span>
                  )}
                </div>
                {/* 質問プレビュー */}
                {r.question && (
                  <p className="text-xs text-gray-700 mb-1 line-clamp-2">
                    <span className="font-medium text-gray-500">Q: </span>{r.question}
                  </p>
                )}
                {/* 回答プレビュー */}
                {r.answer && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    <span className="font-medium">A: </span>{r.answer}
                  </p>
                )}
                {/* フィードバック（質問・回答がない場合のみ） */}
                {!r.question && r.feedback && (
                  <p className="text-xs text-gray-400 truncate max-w-md">{r.feedback}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-base font-semibold text-gray-900">{r.score?.toFixed(1)}</div>
                <div className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
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

      {/* 詳細画面（モーダル） */}
      {selectedRow && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  {selectedRow.eid && (
                    <span className="text-sm font-mono font-semibold text-blue-600">{selectedRow.eid}</span>
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">{selectedRow.job_role}</h2>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(selectedRow.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedRow(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 基本情報 */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Interviewer EID</p>
                  <p className="font-mono font-medium text-gray-900">{selectedRow.interviewer_eid || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Interviewee EID</p>
                  <p className="font-mono font-medium text-gray-900">{selectedRow.eid || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">面接日</p>
                  <p className="text-gray-900">{selectedRow._interview_date ? new Date(selectedRow._interview_date).toLocaleDateString('ja-JP') : '—'}</p>
                </div>
              </div>

              {/* スコア */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">総合スコア</span>
                  <span className="text-2xl font-bold text-gray-900">{selectedRow.score?.toFixed(1)}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LEVEL_COLOR[selectedRow.level] ?? 'bg-gray-50 text-gray-500'}`}>
                  {selectedRow.level}
                </span>
                {(selectedRow.technical_score != null || selectedRow.expression_score != null) && (
                  <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-blue-100">
                    {[
                      { label: '技術力', value: selectedRow.technical_score },
                      { label: '表現力', value: selectedRow.expression_score },
                      { label: '論理力', value: selectedRow.logic_score },
                      { label: '日本語', value: selectedRow.japanese_score },
                    ].filter(s => s.value != null).map(s => (
                      <div key={s.label}>
                        <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                        <p className="text-lg font-semibold text-gray-900">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 問題 */}
              {selectedRow.question && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">面接問題</p>
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">{selectedRow.question}</div>
                </div>
              )}

              {/* 回答 */}
              {selectedRow.answer && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">回答</p>
                  <div className="bg-blue-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">{selectedRow.answer}</div>
                </div>
              )}

              {/* フィードバック */}
              {selectedRow.feedback && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">AI 評価フィードバック</p>
                  <div className="bg-yellow-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">{selectedRow.feedback}</div>
                </div>
              )}

              {/* 設計答題記録 */}
              {selectedRow._design_answers && selectedRow._design_answers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-3">設計答題記録</p>
                  <div className="space-y-3">
                    {selectedRow._design_answers.map((answer: any) => (
                      <div key={answer.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">問 {answer.question_number}</span>
                          <span className={`text-sm font-bold ${['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500', 'text-green-600'][answer.ai_score] || 'text-gray-500'}`}>
                            {answer.ai_score}/5
                          </span>
                        </div>
                        {answer.user_answer && (
                          <details className="mb-2">
                            <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900">回答を表示</summary>
                            <p className="mt-1 pl-2 py-1 bg-gray-50 rounded border border-gray-100 whitespace-pre-wrap text-xs text-gray-600">
                              {answer.user_answer}
                            </p>
                          </details>
                        )}
                        {answer.ai_feedback && (
                          <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">{answer.ai_feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-300 font-mono pt-1">user: {selectedRow.user_id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
