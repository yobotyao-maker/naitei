'use client'
import Link from 'next/link'
import { P_LEVEL_LABELS } from '@/lib/design-scoring'

type AnswerItem = {
  question: { number: number; category: string; content: string }
  answer: string
  result: { score: number; feedback: string }
}

type Props = {
  backgroundScore: number
  technicalScore: number
  totalScore: number
  pLevel: string
  selectedDomains: string[]
  answers: AnswerItem[]
  overallFeedback: string
  onRestart: () => void
}

function ScoreGauge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{label}（/{max}）</div>
      <div className="mt-2 bg-gray-100 rounded-full h-1.5 w-full">
        <div className="bg-[#2D5BE3] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function DesignSummary({
  backgroundScore,
  technicalScore,
  totalScore,
  pLevel,
  selectedDomains,
  answers,
  overallFeedback,
  onRestart,
}: Props) {
  const plInfo = P_LEVEL_LABELS[pLevel] ?? P_LEVEL_LABELS['P1']

  return (
    <div className="space-y-5">
      {/* Pレベルカード */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-3">
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">総合判定</div>
        <div className={`text-5xl font-bold ${plInfo.color}`}>{pLevel}</div>
        <div className="text-base font-semibold text-gray-800">{plInfo.label.replace(`${pLevel} — `, '')}</div>
        <p className="text-sm text-gray-500 leading-relaxed">{plInfo.description}</p>
      </div>

      {/* スコア内訳 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-5">スコア内訳</h3>
        <div className="grid grid-cols-3 gap-6">
          <ScoreGauge value={backgroundScore} max={30} label="背景評価" />
          <ScoreGauge value={technicalScore} max={50} label="技術問題" />
          <ScoreGauge value={totalScore} max={80} label="合計" />
        </div>
      </div>

      {/* 選択領域 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="text-xs font-medium text-gray-500 mb-3">受験領域</div>
        <div className="flex flex-wrap gap-2">
          {selectedDomains.map(d => (
            <span key={d} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* AIフィードバック */}
      {overallFeedback && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="text-xs font-medium text-gray-500">総合フィードバック</div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{overallFeedback}</p>
        </div>
      )}

      {/* 問題別結果 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="text-sm font-semibold text-gray-700">問題別結果</div>
        {answers.map((item, i) => (
          <div key={i} className="border-t border-gray-50 pt-4 first:border-0 first:pt-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <span className="text-xs text-gray-500 flex-1 leading-relaxed">{item.question.content.slice(0, 60)}…</span>
              <span className={`text-sm font-bold flex-shrink-0 ${
                item.result.score >= 4 ? 'text-green-600' :
                item.result.score >= 3 ? 'text-blue-500' :
                item.result.score >= 2 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {item.result.score}/5
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{item.result.feedback}</p>
          </div>
        ))}
      </div>

      {/* アクション */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-2xl transition-all text-sm"
        >
          もう一度受ける
        </button>
        <Link
          href="/interview"
          className="flex-1 text-center bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all text-sm"
        >
          面接練習へ
        </Link>
      </div>
    </div>
  )
}
