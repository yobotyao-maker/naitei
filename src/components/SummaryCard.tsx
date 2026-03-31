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
  onRestart: () => void
}

export default function SummaryCard({ history, jobRole, lang, onRestart }: Props) {
  const avgScore = history.reduce((sum, h) => sum + (h.result.score ?? 0), 0) / history.length
  const levelCounts = history.reduce<Record<string, number>>((acc, h) => {
    acc[h.result.level] = (acc[h.result.level] ?? 0) + 1
    return acc
  }, {})
  const topLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const maxScore = Math.max(...history.map(h => h.result.score ?? 0))

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
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

      <button
        onClick={onRestart}
        className="w-full bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-colors"
      >
        もう一度練習する →
      </button>
    </div>
  )
}
