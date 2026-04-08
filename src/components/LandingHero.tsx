'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const stats = [
  { value: 'AI',    label: '本番同様の質問' },
  { value: 'S1〜S4', label: '能力レベル評価' },
  { value: '3秒',   label: '即時フィードバック' },
]

export default function LandingHero() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-6 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="mb-5 inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded-full font-medium border border-blue-100">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        AI × 面接練習 · 在日IT人向け
      </div>

      <h1 className="text-5xl md:text-6xl font-medium text-gray-900 mb-5 leading-tight tracking-tight">
        内定まで、<br /><span className="text-[#2D5BE3]">一緒に。</span>
      </h1>

      <p className="text-gray-400 text-lg mb-10 max-w-sm leading-relaxed">
        AIがあなたの面接力を本気で診断。<br />弱点を見つけて、次の面接で勝つ。
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-16">
        <Link
          href="/interview"
          className="bg-[#2D5BE3] hover:bg-blue-700 active:scale-95 text-white text-base font-medium px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-100"
        >
          面接を始める →
        </Link>
        <Link
          href="/design"
          className="border border-[#2D5BE3] hover:bg-blue-50 active:scale-95 text-[#2D5BE3] text-base font-medium px-8 py-4 rounded-2xl transition-all"
        >
          設計コース →
        </Link>
        <Link
          href="/auth"
          className="border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-600 text-base font-medium px-8 py-4 rounded-2xl transition-all"
        >
          ログイン / 登録
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
        {stats.map(s => (
          <div key={s.value} className="text-center">
            <div className="text-xl font-medium text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
