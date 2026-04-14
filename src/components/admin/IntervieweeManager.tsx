'use client'
import { useState, useCallback } from 'react'

type Row = {
  eid: string
  department: string | null
  comprehensive_rating: number
  total_interviews: number
  latest_interview_date: string | null
  p1_count: number
  p2_count: number
  p3_count: number
  p4_count: number
  avg_technical_score: number
  avg_expression_score: number
  avg_logic_score: number
  avg_japanese_score: number
}

export default function IntervieweeManager() {
  const [eid,           setEid]           = useState('')
  const [page,          setPage]          = useState(0)
  const [rows,          setRows]          = useState<Row[]>([])
  const [total,         setTotal]         = useState<number | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [editingRow,    setEditingRow]    = useState<Row | null>(null)
  const [editDept,      setEditDept]      = useState('')
  const [editLoading,   setEditLoading]   = useState(false)
  const [editError,     setEditError]     = useState('')

  const search = useCallback(async (p = 0) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (eid) params.set('eid', eid.trim())
    params.set('page', String(p))

    const res  = await fetch(`/api/admin/interviewees?${params}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setPage(p)
    setLoading(false)
  }, [eid])

  const handleEdit = (row: Row) => {
    setEditingRow(row)
    setEditDept(row.department || '')
    setEditError('')
  }

  const handleSave = async () => {
    if (!editingRow) return
    setEditLoading(true)
    setEditError('')

    try {
      const res = await fetch(`/api/admin/interviewees/${editingRow.eid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: editDept }),
      })
      const data = await res.json()

      if (!res.ok) {
        setEditError(data.error || 'Failed to update')
        return
      }

      // Refresh the list
      setEditingRow(null)
      search(page)
    } catch (e: any) {
      setEditError(e.message)
    } finally {
      setEditLoading(false)
    }
  }

  const totalPages = total != null ? Math.ceil(total / 20) : 0
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* 検索バー */}
      <div className="p-5 border-b border-gray-50 space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 font-mono"
            placeholder="EID で検索"
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
        {total != null && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{total} 件</span>
          </div>
        )}
      </div>

      {/* 結果一覧 */}
      {rows.length === 0 && total != null && (
        <p className="text-xs text-gray-300 text-center py-10">条件に一致する面試者がいません</p>
      )}
      {rows.length === 0 && total == null && (
        <p className="text-xs text-gray-300 text-center py-10">EID を入力して検索するか、空欄のまま検索で全件表示</p>
      )}

      <div className="overflow-x-auto">
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-700">EID</th>
                <th className="px-5 py-3 text-left font-medium text-gray-700">部門</th>
                <th className="px-5 py-3 text-left font-medium text-gray-700">综合評級</th>
                <th className="px-5 py-3 text-center font-medium text-gray-700">採訪次数</th>
                <th className="px-5 py-3 text-left font-medium text-gray-700">最新日期</th>
                <th className="px-5 py-3 text-center font-medium text-gray-700 whitespace-nowrap">P1/P2/P3/P4</th>
                <th className="px-5 py-3 text-center font-medium text-gray-700 whitespace-nowrap">技術力/表現/論理/日本語</th>
                <th className="px-5 py-3 text-center font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(r => (
                <tr key={r.eid} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {r.eid}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{r.department || '—'}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{r.comprehensive_rating.toFixed(1)}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{r.total_interviews}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{formatDate(r.latest_interview_date)}</td>
                  <td className="px-5 py-3 text-center text-xs text-gray-600 font-mono">
                    {r.p1_count}/{r.p2_count}/{r.p3_count}/{r.p4_count}
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-gray-600 font-mono">
                    {r.avg_technical_score.toFixed(1)}/{r.avg_expression_score.toFixed(1)}/{r.avg_logic_score.toFixed(1)}/{r.avg_japanese_score.toFixed(1)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

      {/* 編集モーダル */}
      {editingRow && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          onClick={() => setEditingRow(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-sm font-medium text-gray-900 mb-1">部門を編集</div>
            <div className="text-xs text-gray-400 mb-4 font-mono">{editingRow.eid}</div>
            <input
              type="text"
              placeholder="部門名"
              value={editDept}
              onChange={e => setEditDept(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 mb-3"
            />
            {editError && <p className="text-xs text-red-500 mb-3">{editError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingRow(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={editLoading}
                className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                {editLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
