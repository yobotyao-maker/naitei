'use client'
import { useState, useEffect, useCallback } from 'react'
import { DESIGN_DOMAINS } from '@/lib/design-scoring'

type Question = {
  id: string
  number: number
  category: string
  content: string
  complexity: string | null
  is_required: boolean
  display_order: string | null
  design_domains: string[]
  hints?: {
    template?: string[]
    tips?: string[]
    keywords?: string[]
  }
}

const COMPLEXITY_OPTIONS = ['必須問題', '通常問題', '加点減点問題', '補足事項', '-']
const DISPLAY_ORDER_OPTIONS = ['進め', '任意', '必須']
const COMPLEXITY_COLOR: Record<string, string> = {
  '必須問題':    'bg-red-50 text-red-600',
  '通常問題':    'bg-blue-50 text-blue-600',
  '加点減点問題': 'bg-orange-50 text-orange-600',
  '補足事項':    'bg-gray-50 text-gray-500',
  '-':           'bg-gray-50 text-gray-400',
}

const EMPTY_FORM = {
  number: '',
  category: '',
  content: '',
  complexity: '通常問題',
  is_required: false,
  display_order: '任意',
  design_domains: [] as string[],
  hintsTemplate: '',
  hintsTips: '',
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState<Question | null>(null)
  const [creating,  setCreating]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/questions')
    const data = await res.json()
    setQuestions(data.questions ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const categories = Array.from(new Set(questions.map(q => q.category))).sort()

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.content.includes(search) || String(q.number).includes(search)
    const matchCat    = !filterCat || q.category === filterCat
    return matchSearch && matchCat
  })

  const startEdit = (q: Question) => {
    setEditing(q)
    setCreating(false)
    setForm({
      number:         String(q.number),
      category:       q.category,
      content:        q.content,
      complexity:     q.complexity ?? '通常問題',
      is_required:    q.is_required,
      display_order:  q.display_order ?? '任意',
      design_domains: q.design_domains ?? [],
      hintsTemplate:  q.hints?.template?.join('\n') ?? '',
      hintsTips:      q.hints?.tips?.join('\n') ?? '',
    })
  }

  const startCreate = () => {
    setEditing(null)
    setCreating(true)
    setForm(EMPTY_FORM)
  }

  const cancel = () => { setEditing(null); setCreating(false) }

  const toggleDomain = (d: string) => {
    setForm(f => ({
      ...f,
      design_domains: f.design_domains.includes(d)
        ? f.design_domains.filter(x => x !== d)
        : [...f.design_domains, d],
    }))
  }

  const save = async () => {
    if (!form.number || !form.category || !form.content) return
    setSaving(true)
    const hints = {
      template: form.hintsTemplate.split('\n').map(s => s.trim()).filter(Boolean),
      tips: form.hintsTips.split('\n').map(s => s.trim()).filter(Boolean),
      keywords: [] as string[],
    }
    const payload = {
      number:         Number(form.number),
      category:       form.category,
      content:        form.content,
      complexity:     form.complexity || null,
      is_required:    form.is_required,
      display_order:  form.display_order || null,
      design_domains: form.design_domains,
      hints:          (hints.template.length > 0 || hints.tips.length > 0) ? hints : null,
    }

    const url    = editing ? `/api/admin/questions/${editing.id}` : '/api/admin/questions'
    const method = editing ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data   = await res.json()

    if (res.ok) {
      if (editing) {
        setQuestions(qs => qs.map(q => q.id === editing.id ? data.question : q))
      } else {
        setQuestions(qs => [...qs, data.question].sort((a, b) => a.number - b.number))
      }
      cancel()
    }
    setSaving(false)
  }

  const del = async (q: Question) => {
    if (!confirm(`Q${q.number} を削除しますか？`)) return
    setDeleting(q.id)
    const res = await fetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' })
    if (res.ok) setQuestions(qs => qs.filter(x => x.id !== q.id))
    setDeleting(null)
  }

  const isModal = editing !== null || creating

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          設計問題一覧 {!loading && <span className="text-gray-400 font-normal">({questions.length} 問)</span>}
        </span>
        <button
          onClick={startCreate}
          className="bg-[#2D5BE3] hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + 新規追加
        </button>
      </div>

      {/* フィルター */}
      <div className="px-5 py-3 border-b border-gray-50 flex gap-2 flex-wrap">
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-48"
          placeholder="問題番号・内容で検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white text-gray-600"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">全カテゴリ</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* テーブル */}
      {loading ? (
        <p className="text-xs text-gray-300 text-center py-10">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-10">問題がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 w-12">No.</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 w-28">カテゴリ</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">問題内容</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 w-24">複雑度</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 w-20">出題区分</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 w-20">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(q => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{q.number}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{q.category}</td>
                  <td className="px-4 py-3 text-xs text-gray-800 max-w-xs">
                    <p className="line-clamp-2 leading-relaxed">{q.content}</p>
                    {q.design_domains.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {q.design_domains.map(d => (
                          <span key={d} className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">{d}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {q.complexity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${COMPLEXITY_COLOR[q.complexity] ?? 'bg-gray-50 text-gray-400'}`}>
                        {q.complexity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{q.display_order ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        className="text-xs text-[#2D5BE3] hover:text-blue-700 font-medium transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => del(q)}
                        disabled={deleting === q.id}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:text-gray-300"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 編集 / 新規モーダル */}
      {isModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={cancel}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {editing ? `Q${editing.number} 編集` : '新規問題追加'}
              </h2>
              <button onClick={cancel} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 番号・カテゴリ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">問題番号 <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    value={form.number}
                    onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">カテゴリ <span className="text-red-400">*</span></label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="例: 基本設計"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    list="cat-list"
                  />
                  <datalist id="cat-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* 問題内容 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">問題内容 <span className="text-red-400">*</span></label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none leading-relaxed"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>

              {/* 複雑度・出題区分 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">複雑度</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    value={form.complexity}
                    onChange={e => setForm(f => ({ ...f, complexity: e.target.value }))}
                  >
                    {COMPLEXITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">出題区分</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                  >
                    {DISPLAY_ORDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* 必須フラグ */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={form.is_required}
                  onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="is_required" className="text-sm text-gray-700">必須問題（常に出題）</label>
              </div>

              {/* 設計領域 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">関連設計領域</label>
                <div className="flex flex-wrap gap-2">
                  {DESIGN_DOMAINS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDomain(d)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        form.design_domains.includes(d)
                          ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                          : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* ヒント - テンプレート */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  💡 回答テンプレート <span className="text-gray-400 font-normal">（1行1項目）</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="背景説明&#10;具体的な実装方法&#10;直面した課題&#10;解決策と成果"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none leading-relaxed text-gray-700"
                  value={form.hintsTemplate}
                  onChange={e => setForm(f => ({ ...f, hintsTemplate: e.target.value }))}
                />
              </div>

              {/* ヒント - ポイント */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  🎯 回答のポイント <span className="text-gray-400 font-normal">（1行1項目）</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="具体例を交える&#10;数字で示す&#10;なぜかを説明する"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none leading-relaxed text-gray-700"
                  value={form.hintsTips}
                  onChange={e => setForm(f => ({ ...f, hintsTips: e.target.value }))}
                />
              </div>

              {/* ボタン */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={saving || !form.number || !form.category || !form.content}
                  className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  {saving ? '保存中...' : editing ? '更新する' : '追加する'}
                </button>
                <button
                  onClick={cancel}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
