'use client'
import { useState } from 'react'

type Props = {
  question: { content: string }
  onSubmit: (answer: string) => void
  onSkip: () => void
}

export default function DesignAnswerInput({ question, onSubmit, onSkip }: Props) {
  const [answer, setAnswer] = useState('')

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-5">
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">質問</h2>
        <p className="text-gray-800 text-sm leading-relaxed">{question.content}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">あなたの回答</label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="具体的な経験・プロジェクト例を交えて回答してください..."
          rows={8}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
        />
        <div className="text-right text-xs text-gray-300 mt-1">{answer.length} 文字</div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium py-3 rounded-2xl transition-all"
        >
          スキップ
        </button>
        <button
          type="button"
          disabled={answer.trim().length < 20}
          onClick={() => onSubmit(answer.trim())}
          className="flex-[3] bg-[#2D5BE3] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-medium py-3 rounded-2xl transition-all"
        >
          採点する →
        </button>
      </div>
    </div>
  )
}
