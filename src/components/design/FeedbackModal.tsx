'use client'
import { useState } from 'react'

type Props = {
  sessionId: string | null
  onSubmit: (feedback: { feedback_text: string; rating: number; feedback_type: string }) => void
  onClose: () => void
}

export default function FeedbackModal({ sessionId, onSubmit, onClose }: Props) {
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(5)
  const [feedbackType, setFeedbackType] = useState('その他')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!sessionId || !feedbackText.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/design/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          feedback_text: feedbackText.trim(),
          rating,
          feedback_type: feedbackType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error || 'Feedback submission failed'
        console.error('API error:', errorMsg)
        setError(errorMsg)
        return
      }
      onSubmit({ feedback_text: feedbackText, rating, feedback_type: feedbackType })
      onClose()
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '不明なエラー'
      console.error('Fetch error:', e)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">フィードバック</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* フィードバック種別 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">フィードバック種別</label>
          <select
            value={feedbackType}
            onChange={e => setFeedbackType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          >
            <option>建議</option>
            <option>問題</option>
            <option>表賛</option>
            <option>その他</option>
          </select>
        </div>

        {/* 星評価 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">満足度（1-5 星）</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </button>
            ))}
            <span className="ml-auto text-sm font-medium text-gray-600">{rating}/5</span>
          </div>
        </div>

        {/* 自由テキスト */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">コメント（任意）</label>
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="ご意見・ご感想をお聞かせください..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />
          <div className="text-right text-xs text-gray-300 mt-1">{feedbackText.length} 文字</div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-2xl transition-all text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedbackText.trim() || loading}
            className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-2xl transition-all text-sm"
          >
            {loading ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  )
}
