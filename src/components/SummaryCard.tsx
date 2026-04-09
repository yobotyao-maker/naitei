'use client'
import { useRef } from 'react'
import type { Lang } from '@/lib/prompts'
import { levelColor, levelBg } from '@/lib/constants'

export interface HistoryItem {
  question: string
  answer: string
  result: any
}

interface Props {
  history: HistoryItem[]
  jobRole: string
  lang: Lang
  interviewerEid?: string
  intervieweeEid?: string
  onRestart: () => void
}

export default function SummaryCard({ history, jobRole, lang, interviewerEid, intervieweeEid, onRestart }: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const avgScore  = history.reduce((sum, h) => sum + (h.result.score ?? 0), 0) / history.length
  const levelCounts = history.reduce<Record<string, number>>((acc, h) => {
    acc[h.result.level] = (acc[h.result.level] ?? 0) + 1
    return acc
  }, {})
  const topLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const maxScore = Math.max(...history.map(h => h.result.score ?? 0))
  const today    = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

  const handlePrint = () => window.print()

  return (
    <>
      {/* 印刷スタイル */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-report, #print-report * { visibility: visible; }
          #print-report { position: fixed; top: 0; left: 0; width: 100%; padding: 24px 32px; }
          .no-print { display: none !important; }
        }
        @page { size: A4; margin: 15mm; }
      `}</style>

      {/* 画面表示カード */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 no-print">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-1">
            {jobRole} · {lang === 'ja' ? '🇯🇵 日本語' : '🇨🇳 中文'} · 面接終了
          </div>
          <div className="text-5xl font-medium text-gray-900 mb-1">{avgScore.toFixed(1)}</div>
          <div className="text-sm text-gray-400">{history.length} 問の平均スコア</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <div className="text-xl font-medium text-gray-900">{history.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">回答題数</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <div className={`text-xl font-medium ${levelColor[topLevel] ?? 'text-gray-600'}`}>{topLevel}</div>
            <div className="text-xs text-gray-400 mt-0.5">最多レベル</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <div className="text-xl font-medium text-gray-900">{maxScore.toFixed(1)}</div>
            <div className="text-xs text-gray-400 mt-0.5">最高スコア</div>
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
          {history.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-300">Q{i + 1}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelBg[item.result.level] ?? 'bg-gray-50'} ${levelColor[item.result.level] ?? 'text-gray-500'}`}>
                    {item.result.level}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 shrink-0">{item.result.score?.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-600 mb-1.5 line-clamp-2">{item.question}</p>
              {item.result.feedback && (
                <p className="text-xs text-gray-400 line-clamp-1">💬 {item.result.feedback}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 border border-[#2D5BE3] text-[#2D5BE3] hover:bg-blue-50 font-medium py-3.5 rounded-xl transition-colors text-sm"
          >
            PDF レポートを保存
          </button>
          <button
            onClick={onRestart}
            className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-colors text-sm"
          >
            もう一度練習する →
          </button>
        </div>
      </div>

      {/* 印刷専用レポート */}
      <div id="print-report" ref={printRef} style={{ display: 'none', fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" }}>
        <style>{`
          @media print { #print-report { display: block !important; } }
        `}</style>

        {/* ヘッダー */}
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>naitei.ai</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>AI 面接評価レポート</div>
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>
            <div>{today}</div>
          </div>
        </div>

        {/* 基本情報 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px', marginBottom: '20px', fontSize: '13px' }}>
          {intervieweeEid && <div><span style={{ color: '#6b7280' }}>Interviewee EID：</span><strong>{intervieweeEid}</strong></div>}
          {interviewerEid && <div><span style={{ color: '#6b7280' }}>Interviewer EID：</span><strong>{interviewerEid}</strong></div>}
          <div><span style={{ color: '#6b7280' }}>応募職種：</span><strong>{jobRole}</strong></div>
          <div><span style={{ color: '#6b7280' }}>面接言語：</span><strong>{lang === 'ja' ? '日本語' : '中文'}</strong></div>
        </div>

        {/* スコアサマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: '平均スコア',  value: avgScore.toFixed(1) },
            { label: '最高スコア',  value: maxScore.toFixed(1) },
            { label: '最多レベル',  value: topLevel },
            { label: '回答題数',    value: String(history.length) },
          ].map(k => (
            <div key={k.label} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* 問答詳細 */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          回答詳細
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((item, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Q{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#eff6ff', color: '#2563eb', fontWeight: '600' }}>
                    {item.result.level}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{item.result.score?.toFixed(1)}</span>
                </div>
              </div>
              <div style={{ padding: '10px 14px' }}>
                <p style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', lineHeight: '1.6' }}><strong>質問：</strong>{item.question}</p>
                <p style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', lineHeight: '1.6', background: '#eff6ff', padding: '8px 10px', borderRadius: '6px' }}>
                  <strong>回答：</strong>{item.answer}
                </p>
                {item.result.feedback && (
                  <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.6', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px' }}>
                    <strong>AI評価：</strong>{item.result.feedback}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          このレポートは naitei.ai により自動生成されました · {today}
        </div>
      </div>
    </>
  )
}
