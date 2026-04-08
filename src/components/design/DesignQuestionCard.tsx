'use client'

type Props = {
  question: {
    number: number
    category: string
    content: string
    complexity: string | null
  }
  current: number
  total: number
  onReady: () => void
}

const COMPLEXITY_BADGE: Record<string, { label: string; cls: string }> = {
  '必須問題':   { label: '必須', cls: 'bg-red-50 text-red-600 border-red-100' },
  '通常問題':   { label: '通常', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  '加点減点問題': { label: '加点', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  '補足事項':   { label: '補足', cls: 'bg-gray-50 text-gray-500 border-gray-100' },
  '-':          { label: '基礎', cls: 'bg-gray-50 text-gray-500 border-gray-100' },
}

export default function DesignQuestionCard({ question, current, total, onReady }: Props) {
  const badge = COMPLEXITY_BADGE[question.complexity ?? '-'] ?? COMPLEXITY_BADGE['-']

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">問 {current} / {total}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <span className="text-xs text-gray-400">{question.category}</span>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400 font-medium">Q{question.number}</div>
        <p className="text-gray-900 text-base leading-relaxed">{question.content}</p>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700 leading-relaxed">
        <span className="font-medium">ヒント：</span>
        具体的な経験やプロジェクト例を交えながら、設計上の判断根拠も含めて回答してください。
      </div>

      <button
        onClick={onReady}
        className="w-full bg-[#2D5BE3] hover:bg-blue-700 active:scale-95 text-white font-medium py-3.5 rounded-2xl transition-all"
      >
        回答する
      </button>
    </div>
  )
}
