'use client'
import { useState } from 'react'

type PlanId = 'pack' | 'pro'

export default function UpgradePrompt({ used, limit, onBack }: {
  used: number
  limit: number
  onBack: () => void
}) {
  const [loading, setLoading] = useState<PlanId | null>(null)

  const handleUpgrade = async (plan: PlanId) => {
    setLoading(plan)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
      <div className="text-4xl mb-4">🚀</div>
      <h2 className="text-xl font-medium text-gray-900 mb-2">練習回数を使い切りました</h2>
      <p className="text-sm text-gray-400 mb-1">
        使用回数: <span className="font-medium text-gray-700">{used} / {limit} 回</span>
      </p>
      <p className="text-sm text-gray-400 mb-6">
        プランを選んで練習を続けましょう
      </p>

      <div className="space-y-3 mb-6 text-left">
        {/* Pack */}
        <div className="bg-blue-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-700">Pack</span>
            <span className="text-lg font-medium text-gray-900">¥980 <span className="text-xs font-normal text-gray-400">買い切り</span></span>
          </div>
          <p className="text-xs text-blue-500 mb-3">転職前の集中練習に · 何度でも追加可</p>
          <ul className="text-xs text-blue-600 space-y-1 mb-4">
            <li>✓ AI面接 +5回追加</li>
            <li>✓ 詳細フィードバック · 履歴保存</li>
            <li>✓ Benchmark比較 · 足りなければ何度でも追加できます</li>
          </ul>
          <button
            onClick={() => handleUpgrade('pack')}
            disabled={!!loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading === 'pack' ? '処理中...' : '¥980 で +5回追加する →'}
          </button>
        </div>

        {/* Pro */}
        <div className="bg-yellow-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-yellow-700">Pro</span>
            <span className="text-lg font-medium text-gray-900">¥1,980 <span className="text-xs font-normal text-gray-400">/ 月</span></span>
          </div>
          <p className="text-xs text-yellow-600 mb-3">無制限で練習 · 全機能利用可能</p>
          <ul className="text-xs text-yellow-700 space-y-1 mb-4">
            <li>✓ 無制限の面接練習</li>
            <li>✓ 全岗位・全言語対応</li>
            <li>✓ 優先サポート</li>
          </ul>
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={!!loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading === 'pro' ? '処理中...' : '¥1,980/月 で始める →'}
          </button>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
      >
        トップに戻る
      </button>
    </div>
  )
}
