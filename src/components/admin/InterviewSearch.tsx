'use client'
import { useState, useCallback } from 'react'

type Row = {
  id: string; user_id: string; eid: string | null; job_role: string; score: number
  level: string; feedback: string; lang: string | null
  technical_score: number | null; expression_score: number | null
  logic_score: number | null; japanese_score: number | null
  created_at: string
  question?: string; answer?: string; experience?: string
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
    if (keyword) params.set('keyword', keyword)
    if (eid)     params.set('eid',     eid.trim())
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
  }, [keyword, eid, level, from, to])

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
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            placeholder="EID..."
            value={eid}
            onChange={e => setEid(e.target.value)}
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
          <div
            key={r.id}
            onClick={() => setSelectedRow(r)}
            className="px-5 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                {r.eid && (
                  <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{r.eid}</span>
                )}
                <span className="text-sm font-medium text-gray-800">{r.job_role}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLOR[r.level] ?? 'bg-gray-50 text-gray-500'}`}>
                  {r.level}
                </span>
                {r.lang && r.lang !== 'zh' && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{r.lang}</span>
                )}
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
            {/* 採点分項目 */}
            {(r.technical_score != null || r.expression_score != null) && (
              <div className="flex gap-3 text-xs text-gray-400 mb-1">
                {r.technical_score  != null && <span>技術 {r.technical_score}</span>}
                {r.expression_score != null && <span>表現 {r.expression_score}</span>}
                {r.logic_score      != null && <span>論理 {r.logic_score}</span>}
                {r.japanese_score   != null && <span>日語 {r.japanese_score}</span>}
              </div>
            )}
            {r.feedback && (
              <p className="text-xs text-gray-400 truncate">{r.feedback}</p>
            )}
            <p className="text-xs text-gray-300 mt-0.5 font-mono">{r.user_id?.slice(0,12)}…</p>
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

      {/* 詳細モダール */}
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
                <h2 className="text-lg font-semibold text-gray-900">{selectedRow.job_role}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(selectedRow.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* コンテンツ */}
            <div className="px-6 py-5 space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">EID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedRow.eid || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">経験</label>
                  <p className="text-sm text-gray-900">{selectedRow.experience || '未指定'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">ユーザーID</label>
                  <p className="text-xs text-gray-400 font-mono">{selectedRow.user_id}</p>
                </div>
              </div>

              {/* スコア */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <label className="text-xs font-medium text-gray-600">総合スコア</label>
                  <p className="text-2xl font-bold text-gray-900">{selectedRow.score?.toFixed(1)}</p>
                </div>
                <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${LEVEL_COLOR[selectedRow.level] ?? 'bg-gray-50 text-gray-500'}`}>
                  {selectedRow.level}
                </div>
                {(selectedRow.technical_score != null || selectedRow.expression_score != null) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-blue-100">
                    {selectedRow.technical_score  != null && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">技術力</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedRow.technical_score}</p>
                      </div>
                    )}
                    {selectedRow.expression_score != null && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">表現力</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedRow.expression_score}</p>
                      </div>
                    )}
                    {selectedRow.logic_score      != null && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">論理力</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedRow.logic_score}</p>
                      </div>
                    )}
                    {selectedRow.japanese_score   != null && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">日本語</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedRow.japanese_score}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 問題と回答 */}
              {selectedRow.question && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-2">面接問題</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedRow.question}
                  </div>
                </div>
              )}

              {selectedRow.answer && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-2">回答</label>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedRow.answer}
                  </div>
                </div>
              )}

              {/* フィードバック */}
              {selectedRow.feedback && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-2">AI評価フィードバック</label>
                  <div className="bg-yellow-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedRow.feedback}
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
