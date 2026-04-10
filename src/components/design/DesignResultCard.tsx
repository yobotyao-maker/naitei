'use client'

type Props = {
  question: { number: number; category: string; content: string }
  answer: string
  feedback: string
  current: number
  total: number
  onNext: () => void
  onFinish: () => void
}

export default function DesignResultCard({ question, answer, feedback, current, total, onNext, onFinish }: Props) {
  const isLast = current >= total

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
      {/* 質問 */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">質問</h2>
        <p className="text-gray-800 text-sm leading-relaxed">{question.content}</p>
      </div>

      {/* あなたの回答 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">あなたの回答</h3>
        <div className="bg-blue-50 rounded-2xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
          {answer || '（スキップ）'}
        </div>
      </div>

      {/* AI フィードバック */}
      {feedback && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-blue-700 mb-1">AIフィードバック</p>
          <p className="text-sm text-blue-800 leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        {!isLast ? (
          <button
            onClick={onNext}
            className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all text-sm"
          >
            次の問題へ →
          </button>
        ) : (
          <>
            <button
              onClick={onNext}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-2xl transition-all text-sm"
            >
              戻る
            </button>
            <button
              onClick={onFinish}
              className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all text-sm"
            >
              完了 →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
