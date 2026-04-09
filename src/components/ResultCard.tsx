import type { Lang } from '@/lib/prompts'
import { MAX_QUESTIONS, levelColor, levelLabel } from '@/lib/constants'
import BenchmarkCard from './BenchmarkCard'
import { CHARACTERS } from '@/components/manga/manga-design-system'
import { CharacterSVG } from '@/components/manga/CharacterSVG'

interface Props {
  result: any
  jobRole: string
  lang: Lang
  questionCount: number
  characterId?: string
  onContinue: () => void
  onFinish: () => void
}

export default function ResultCard({ result, jobRole, lang, questionCount, characterId, onContinue, onFinish }: Props) {
  const char = characterId ? CHARACTERS[characterId] : undefined
  const charMood = result.score >= 85 ? 'pleased' : result.score >= 65 ? 'neutral' : 'disappointed'
  const zhDimensions = [
    { label: '技術力', pct: result.technicalPct, raw: result.technical, max: 40, weight: '40%' },
    { label: '表現力', pct: result.expressionPct, raw: result.expression, max: 30, weight: '30%' },
    { label: '論理力', pct: result.logicPct, raw: result.logic, max: 30, weight: '30%' },
  ]
  const jaDimensions = [
    { label: '技術力', pct: result.technicalPct, raw: result.technical, max: 30, weight: '30%' },
    { label: '表現力', pct: result.expressionPct, raw: result.expression, max: 25, weight: '25%' },
    { label: '論理力', pct: result.logicPct, raw: result.logic, max: 25, weight: '25%' },
    { label: '日本語力', pct: result.japanesePct, raw: result.japanese, max: 20, weight: '20%' },
  ]
  const dimensions = lang === 'ja' ? jaDimensions : zhDimensions
  const atLimit = questionCount >= MAX_QUESTIONS

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100" id="result-card">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-gray-400">第 {questionCount} 題 / {MAX_QUESTIONS}</span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${lang === 'ja' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {lang === 'ja' ? '🇯🇵 日本語' : '🇨🇳 中文'}
        </span>
      </div>

      {/* キャラクター反応 */}
      {char && (
        <div className="flex items-end gap-3 mb-5">
          <div className="flex flex-col items-center flex-shrink-0">
            <CharacterSVG character={char} mood={charMood} size="sm" />
            <span className="text-[10px] text-gray-500 mt-1 font-medium">{char.name}</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-3 text-sm text-gray-700 leading-relaxed">
            {char.reactions[charMood][Math.floor(Math.random() * char.reactions[charMood].length)]}
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-1">{jobRole} · 面接スコア</div>
        <div className="text-6xl font-medium text-gray-900 mb-1">{result.score?.toFixed(1)}</div>
        <div className={`text-2xl font-medium ${levelColor[result.level] ?? 'text-gray-600'}`}>
          {result.level} · {levelLabel[result.level]}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {dimensions.map(d => (
          <div key={d.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{d.label} <span className="text-gray-300 text-xs">{d.weight}</span></span>
              <span className="font-medium text-gray-900">{d.raw}/{d.max}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full">
              <div className="h-1.5 bg-[#2D5BE3] rounded-full transition-all" style={{ width: `${((d.pct ?? 0) / 10) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-4 mb-5">
        <div className="text-xs text-blue-400 mb-1 font-medium">改善ポイント</div>
        <div className="text-sm text-blue-800">{result.feedback}</div>
      </div>

      {atLimit && (
        <div className="bg-orange-50 rounded-xl px-4 py-3 mb-4 text-xs text-orange-500 text-center">
          已达到 {MAX_QUESTIONS} 题上限，建议结束本次面试查看汇总报告
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onFinish}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          结束面试
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
        >
          继续面试 →
        </button>
      </div>

      <div className="mt-4">
        <BenchmarkCard jobRole={jobRole} userScore={result.score} />
      </div>

      {typeof result.remaining === 'number' && result.remaining <= 2 && result.remaining > 0 && (
        <div className="mt-4 bg-orange-50 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-orange-500 font-medium">
            残り <span className="text-base font-bold">{result.remaining}</span> 回
          </p>
          <p className="text-xs text-orange-400 mt-0.5">
            足りなくなったら ¥2,940 でいつでも +5回 追加できます
          </p>
        </div>
      )}
      {typeof result.remaining === 'number' && result.remaining === 0 && (
        <div className="mt-4 bg-blue-50 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-blue-500 font-medium">練習回数を使い切りました</p>
          <p className="text-xs text-blue-400 mt-0.5">¥2,940 で +5回 追加できます</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-300 mt-4">naitei.ai · AIで内定を掴もう</div>
    </div>
  )
}
