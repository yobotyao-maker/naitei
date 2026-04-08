'use client'
import { useState } from 'react'
import { DESIGN_DOMAINS } from '@/lib/design-scoring'

type Props = {
  onSubmit: (domains: string[]) => void
  onBack: () => void
}

export default function DomainSelector({ onSubmit, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (domain: string) => {
    setSelected(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain],
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">設計領域を選択</h2>
        <p className="text-sm text-gray-400">経験のある設計領域をすべて選んでください（1つ以上必須）</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {DESIGN_DOMAINS.map(domain => {
          const checked = selected.includes(domain)
          return (
            <button
              key={domain}
              type="button"
              onClick={() => toggle(domain)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                checked
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  checked ? 'bg-[#2D5BE3] border-[#2D5BE3]' : 'border-gray-300'
                }`}
              >
                {checked && (
                  <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {domain}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-blue-600">
          {selected.length}領域選択済み — 問題数はセッション開始後に決まります（最大10問）
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-2xl transition-all"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSubmit(selected)}
          className="flex-[2] bg-[#2D5BE3] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-medium py-3 rounded-2xl transition-all"
        >
          面談を開始する →
        </button>
      </div>
    </div>
  )
}
