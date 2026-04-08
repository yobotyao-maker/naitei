'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const P_LEVEL_LABEL: Record<string, { title: string; desc: string; color: string }> = {
  P1: { title: 'P1 — 設計初心者', desc: 'SVの指導によりSimple設計を担当可。トレーニング&P1試験が必要。', color: '#6B7280' },
  P2: { title: 'P2 — 設計中級者', desc: 'Medium機能を担当可。Backend/Front設計経験あり。(ML9/ML10)', color: '#3B82F6' },
  P3: { title: 'P3 — 設計高級者', desc: 'Complex機能を担当可。Front+Backend設計経験あり。Review担当可。(ML8/ML9)', color: '#16A34A' },
  P4: { title: 'P4 — 要件担当',  desc: 'システム要件定義に参画可。業務ロジックを理解し最善な要件方針を提案。(ML7/ML8)', color: '#7C3AED' },
}

type Answer = {
  question_number: number
  user_answer: string
  ai_score: number
  ai_feedback: string
  scoring_detail: { accuracy: number; completeness: number; clarity: number; terminology: number } | null
  question: { number: number; category: string; content: string; complexity: string | null } | null
}

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
  overall_feedback: string | null
  completed_at: string
}

export default function ReportPage() {
  const params  = useParams<{ id: string }>()
  const [data,  setData]  = useState<{ session: Session; answers: Answer[] } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/design-sessions/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
      })
  }, [params.id])

  useEffect(() => {
    if (!data) return
    // データ読み込み後に印刷ダイアログを開く
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [data])

  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!data)  return <div className="p-8 text-gray-400">レポートを準備中...</div>

  const { session: s, answers } = data
  const pl = P_LEVEL_LABEL[s.p_level]

  return (
    <>
      {/* 印刷スタイル */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
        body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-[#2D5BE3] text-white text-sm font-medium px-4 py-2 rounded-xl shadow"
        >
          PDFを保存
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10 text-gray-900">

        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-gray-900">
          <div>
            <div className="text-xs text-gray-500 mb-1">naitei.ai</div>
            <h1 className="text-xl font-bold text-gray-900">設計エンジニア 評価レポート</h1>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>{s.interview_date ?? new Date(s.completed_at).toLocaleDateString('ja-JP')}</div>
            <div className="mt-0.5">レポートID: {s.id.slice(0, 8)}</div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
          <Info label="面談対象者 EID"  value={s.interviewee_eid ?? '—'} />
          <Info label="面談担当者 EID"  value={s.interviewer_eid ?? '—'} />
          <Info label="部署"            value={s.department ?? '—'} />
          <Info label="面談日"          value={s.interview_date ?? '—'} />
          <Info label="選択設計領域"    value={(s.selected_domains ?? []).join('、') || '—'} />
        </div>

        {/* スコアサマリー */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">採点サマリー</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '背景スコア',  value: `${s.background_score}`,       sub: '/ 50点' },
              { label: '技術スコア',  value: `${s.technical_score}`,        sub: '/ 50点' },
              { label: '合計スコア',  value: `${s.total_score}`,            sub: '/ 100点' },
              { label: 'P レベル',    value: s.p_level,                     sub: pl?.title.split(' — ')[1] ?? '' },
            ].map(k => (
              <div
                key={k.label}
                className="border rounded-xl p-3 text-center"
                style={k.label === 'P レベル' ? { borderColor: pl?.color, backgroundColor: `${pl?.color}10` } : { borderColor: '#E5E7EB' }}
              >
                <div
                  className="text-2xl font-bold"
                  style={k.label === 'P レベル' ? { color: pl?.color } : { color: '#111827' }}
                >
                  {k.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
                <div className="text-xs text-gray-400">{k.sub}</div>
              </div>
            ))}
          </div>

          {pl && (
            <div
              className="mt-3 rounded-xl px-4 py-2.5 text-sm"
              style={{ backgroundColor: `${pl.color}12`, borderLeft: `3px solid ${pl.color}` }}
            >
              <span className="font-semibold" style={{ color: pl.color }}>{pl.title}</span>
              <span className="text-gray-600 ml-2">{pl.desc}</span>
            </div>
          )}
        </div>

        {/* 回答詳細 */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">回答詳細</h2>
          <div className="space-y-4">
            {answers.map(a => (
              <div key={a.question_number} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* 質問ヘッダー */}
                <div className="bg-gray-50 px-4 py-2.5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500">Q{a.question_number}</span>
                      {a.question?.category && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{a.question.category}</span>
                      )}
                      {a.question?.complexity && a.question.complexity !== '-' && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{a.question.complexity}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{a.question?.content ?? '—'}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xl font-bold text-[#2D5BE3]">{a.ai_score}<span className="text-sm text-gray-400">/5</span></div>
                    {a.scoring_detail && (
                      <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                        <div>正確性 {a.scoring_detail.accuracy} · 網羅性 {a.scoring_detail.completeness}</div>
                        <div>明確性 {a.scoring_detail.clarity} · 専門性 {a.scoring_detail.terminology}</div>
                      </div>
                    )}
                  </div>
                </div>
                {/* 回答本文 */}
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">{a.user_answer || '（回答なし）'}</p>
                  {a.ai_feedback && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 leading-relaxed">
                      <span className="font-medium">AI評価：</span>{a.ai_feedback}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 総合フィードバック */}
        {s.overall_feedback && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">総合フィードバック</h2>
            <div className="border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {s.overall_feedback}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          このレポートは naitei.ai により自動生成されました ·{' '}
          {new Date(s.completed_at).toLocaleString('ja-JP')}
        </div>
      </div>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 shrink-0 w-32">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
