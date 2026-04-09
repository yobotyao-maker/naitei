'use client'
import { useState } from 'react'
import type { Lang } from '@/lib/prompts'

const PRESET_ROLES = ['Javaエンジニア', 'フロントエンド', 'インフラ', 'PM', 'データエンジニア']
const PRESET_EXPS = ['1年未満', '1〜3年', '3〜5年', '5年以上']

export default function InterviewForm({ onSubmit }: { onSubmit: (role: string, exp: string, lang: Lang, interviewerEid: string, intervieweeEid: string) => void }) {
  const [role,          setRole]          = useState('')
  const [exp,           setExp]           = useState('')
  const [lang,          setLang]          = useState<Lang>('zh')
  const [interviewerEid, setInterviewerEid] = useState('')
  const [intervieweeEid, setIntervieweeEid] = useState('')

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-medium text-gray-900 mb-1">面接を始めましょう</h2>
      <p className="text-sm text-gray-400 mb-6">岗位情報を入力してください</p>

      <div className="space-y-5">
        {/* 语言切换 */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">面接言語</label>
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

        {/* 岗位 */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            応募職種 <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  role === r
                    ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 transition"
            placeholder="または直接入力..."
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>

        {/* Interviewer EID */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Interviewer EID <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 transition"
            placeholder="例: EMP001234"
            value={interviewerEid}
            onChange={e => setInterviewerEid(e.target.value)}
          />
        </div>

        {/* Interviewee EID */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Interviewee EID（任意）</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 transition"
            placeholder="例: EMP005678"
            value={intervieweeEid}
            onChange={e => setIntervieweeEid(e.target.value)}
          />
        </div>

        {/* 经验年数 */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">経験年数（任意）</label>
          <div className="flex gap-2">
            {PRESET_EXPS.map(e => (
              <button
                key={e}
                onClick={() => setExp(e)}
                className={`flex-1 text-xs py-2.5 rounded-xl border transition-all ${
                  exp === e
                    ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => role && interviewerEid.trim() && onSubmit(role, exp, lang, interviewerEid.trim(), intervieweeEid.trim())}
          disabled={!role || !interviewerEid.trim()}
          className="w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-4 rounded-2xl transition-colors text-base active:scale-95"
        >
          質問を生成する →
        </button>
      </div>
    </div>
  )
}
