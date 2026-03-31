'use client'
import { useState } from 'react'
import type { Lang } from '@/lib/prompts'

export default function InterviewForm({ onSubmit }: { onSubmit: (role: string, exp: string, lang: Lang) => void }) {
  const [role, setRole] = useState('')
  const [exp, setExp] = useState('')
  const [lang, setLang] = useState<Lang>('zh')

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-medium text-gray-900 mb-1">面接を始めましょう</h2>
      <p className="text-sm text-gray-400 mb-6">岗位信息を入力してください</p>
      <div className="space-y-4">
        {/* 语言切换 */}
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">面接言語</label>
          <div className="flex gap-2">
            {(['zh', 'ja'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors
                  ${lang === l
                    ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
              >
                {l === 'zh' ? '🇨🇳 中文' : '🇯🇵 日本語'}
              </button>
            ))}
          </div>
          {lang === 'ja' && (
            <p className="text-xs text-blue-500 mt-1.5">日本語能力も評価対象になります</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">応募職種 <span className="text-red-400">*</span></label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
            placeholder="例：Javaエンジニア、PM、インフラ..."
            value={role} onChange={e => setRole(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">経験年数（任意）</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
            placeholder="例：3年"
            value={exp} onChange={e => setExp(e.target.value)}
          />
        </div>
        <button
          onClick={() => role && onSubmit(role, exp, lang)}
          disabled={!role}
          className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 rounded-xl transition-colors"
        >
          質問を生成する →
        </button>
      </div>
    </div>
  )
}
