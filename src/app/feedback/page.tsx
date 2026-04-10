'use client'
import { useState } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      // Send feedback (can be enhanced with actual API)
      setMessage('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            ← 戻る
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">フィードバック</h1>
          <p className="text-sm text-gray-400 mb-6">ご意見・ご要望をお聞かせください</p>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              ご意見をお聞かせいただきありがとうございます！
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フィードバック内容 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="アプリの使いやすさ、機能リクエスト、バグ報告など..."
                rows={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim()}
              className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3 rounded-2xl transition-colors text-sm"
            >
              送信
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            個人情報は収集していません
          </p>
        </div>
      </div>
    </main>
  )
}
