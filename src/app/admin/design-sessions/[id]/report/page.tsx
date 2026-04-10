'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const P_LEVEL_LABEL: Record<string, { title: string; desc: string; color: string; bg: string }> = {
  P1: { title: 'P1 — 設計初心者', desc: 'SVの指導によりSimple設計を担当可。トレーニング&P1試験が必要。', color: '#6B7280', bg: '#F3F4F6' },
  P2: { title: 'P2 — 設計中級者', desc: 'Medium機能を担当可。Backend/Front設計経験あり。(ML9/ML10)', color: '#3B82F6', bg: '#EFF6FF' },
  P3: { title: 'P3 — 設計高級者', desc: 'Complex機能を担当可。Front+Backend設計経験あり。Review担当可。(ML8/ML9)', color: '#16A34A', bg: '#F0FDF4' },
  P4: { title: 'P4 — 要件担当',  desc: 'システム要件定義に参画可。業務ロジックを理解し最善な要件方針を提案。(ML7/ML8)', color: '#7C3AED', bg: '#FAF5FF' },
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
          .avoid-break { page-break-inside: avoid; }
          a { text-decoration: none; color: #1F2937; }
        }
        @page {
          size: A4;
          margin: 20mm 20mm 20mm 20mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
          line-height: 1.5;
        }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-[#2D5BE3] text-white text-sm font-medium px-4 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          📄 PDFを保存
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-10 py-12 text-gray-900 bg-white">

        {/* ページ 1: タイトル & スコア */}
        <div className="avoid-break">
          {/* ヘッダー */}
          <div className="mb-10 pb-6 border-b-2 border-gray-900">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">naitei.ai</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">設計エンジニア評価レポート</h1>
            <p className="text-sm text-gray-500">Design Engineer Assessment Report</p>
          </div>

          {/* 基本情報 */}
          <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">面談対象者 EID</p>
              <p className="text-lg font-semibold text-gray-900">{s.interviewee_eid ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">面談担当者 EID</p>
              <p className="text-lg font-semibold text-gray-900">{s.interviewer_eid ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">部署</p>
              <p className="text-base text-gray-700">{s.department ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">面談日</p>
              <p className="text-base text-gray-700">{s.interview_date ?? new Date(s.completed_at).toLocaleDateString('ja-JP')}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">選択設計領域</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(s.selected_domains ?? []).map(d => (
                  <span key={d} className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* スコアサマリー（大きく表示） */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">採点結果</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <ScoreCard label="背景スコア" value={String(s.background_score)} unit="/50" />
              <ScoreCard label="技術スコア" value={String(s.technical_score)} unit="/50" />
              <ScoreCard label="合計スコア" value={String(s.total_score)} unit="/100" highlight />
              <PLevelCard label="P レベル" value={s.p_level} color={pl?.color} bg={pl?.bg} />
            </div>

            {pl && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: pl.bg, borderLeft: `4px solid ${pl.color}` }}
              >
                <p className="font-semibold" style={{ color: pl.color }}>{pl.title}</p>
                <p className="text-gray-600 text-xs mt-1">{pl.desc}</p>
              </div>
            )}
          </div>
        </div>

        {/* ページ 2: 回答詳細 */}
        <div className="page-break">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">回答詳細</h2>

          <div className="space-y-5">
            {answers.map(a => (
              <div key={a.question_number} className="avoid-break border border-gray-200 rounded-lg overflow-hidden">
                {/* ヘッダー */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Q{a.question_number}</span>
                      {a.question?.category && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">{a.question.category}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{a.question?.content ?? '—'}</p>
                  </div>
                  <div className="shrink-0 ml-4 text-right">
                    <div className="text-2xl font-bold text-[#2D5BE3]">
                      {a.ai_score}<span className="text-xs text-gray-400">/5</span>
                    </div>
                  </div>
                </div>

                {/* スコア詳細 */}
                {a.scoring_detail && (
                  <div className="bg-white px-4 py-2 grid grid-cols-4 gap-2 border-b border-gray-100 text-xs">
                    <ScoreDetail label="正確性" value={a.scoring_detail.accuracy} />
                    <ScoreDetail label="網羅性" value={a.scoring_detail.completeness} />
                    <ScoreDetail label="明瞭性" value={a.scoring_detail.clarity} />
                    <ScoreDetail label="専門用語" value={a.scoring_detail.terminology} />
                  </div>
                )}

                {/* 回答本文 */}
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{a.user_answer || '（回答なし）'}</p>
                  {a.ai_feedback && (
                    <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-800 leading-relaxed border-l-2 border-blue-300">
                      <span className="font-semibold">AI評価：</span> {a.ai_feedback}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最後のページ: 総合フィードバック */}
        {s.overall_feedback && (
          <div className="page-break">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">総合フィードバック</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {s.overall_feedback}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
          <p>このレポートは naitei.ai により自動生成されました</p>
          <p className="mt-1">生成日時: {new Date(s.completed_at).toLocaleString('ja-JP')}</p>
          <p className="mt-1">レポートID: {s.id}</p>
        </div>
      </div>
    </>
  )
}

function ScoreCard({ label, value, unit, highlight = false }: { label: string; value: string; unit: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 text-center border ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`text-3xl font-bold ${highlight ? 'text-[#2D5BE3]' : 'text-gray-900'}`}>
        {value}<span className="text-xs text-gray-500">{unit}</span>
      </div>
      <div className="text-xs text-gray-600 mt-1 font-medium">{label}</div>
    </div>
  )
}

function PLevelCard({ label, value, color, bg }: { label: string; value: string; color?: string; bg?: string }) {
  return (
    <div className="rounded-lg p-4 text-center border" style={{ backgroundColor: bg, borderColor: color }}>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-600 mt-1 font-medium">{label}</div>
    </div>
  )
}

function ScoreDetail({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-semibold text-gray-900">{value}</div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  )
}
