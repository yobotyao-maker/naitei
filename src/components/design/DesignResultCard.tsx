'use client'
import { useState } from 'react'

type EvalResult = {
  score: number
  accuracy: number
  completeness: number
  clarity: number
  terminology: number
  feedback: string
}

type Props = {
  question: { number: number; category: string; content: string }
  answer: string
  result: EvalResult
  current: number
  total: number
  onNext: () => void
  onFinish: () => void
}

const SCORE_COLOR = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500', 'text-green-600']

function ScoreBar({ label, value, onInteract }: { label: string; value: number; onInteract: () => void }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition" onClick={onInteract}>
      <span className="w-20 text-xs text-gray-500 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-[#2D5BE3] h-1.5 rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-medium text-gray-700">{value}</span>
    </div>
  )
}

export default function DesignResultCard({ question, answer, result, current, total, onNext, onFinish }: Props) {
  const isLast = current >= total
  const scoreColor = SCORE_COLOR[Math.min(result.score, 5)]
  const [showScore, setShowScore] = useState(true)

  const handleScoreBarClick = () => {
    setShowScore(false)
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">問 {current} / {total} の結果</span>
        <span className="text-xs text-gray-400">{question.category}</span>
      </div>

      {showScore && (
        <div className="text-center py-4">
          <div className={`text-6xl font-bold ${scoreColor}`}>{result.score}</div>
          <div className="text-sm text-gray-400 mt-1">/ 5点</div>
        </div>
      )}

      <div className="space-y-2.5">
        <ScoreBar label="正確性" value={result.accuracy} onInteract={handleScoreBarClick} />
        <ScoreBar label="網羅性" value={result.completeness} onInteract={handleScoreBarClick} />
        <ScoreBar label="明瞭性" value={result.clarity} onInteract={handleScoreBarClick} />
        <ScoreBar label="専門用語" value={result.terminology} onInteract={handleScoreBarClick} />
      </div>

      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2">
        <div className="text-xs font-medium text-gray-500">AIフィードバック</div>
        <p className="text-sm text-gray-800 leading-relaxed">{result.feedback}</p>
      </div>

      <details className="text-xs text-gray-400">
        <summary className="cursor-pointer hover:text-gray-600">あなたの回答を確認</summary>
        <p className="mt-2 leading-relaxed whitespace-pre-wrap">{answer || '（スキップ）'}</p>
      </details>

      {isLast ? (
        <button
          onClick={onFinish}
          className="w-full bg-[#2D5BE3] hover:bg-blue-700 active:scale-95 text-white font-medium py-3.5 rounded-2xl transition-all"
        >
          結果を確認する →
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full bg-[#2D5BE3] hover:bg-blue-700 active:scale-95 text-white font-medium py-3.5 rounded-2xl transition-all"
        >
          次の問題へ →
        </button>
      )}
    </div>
  )
}
