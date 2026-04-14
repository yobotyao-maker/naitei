'use client'
import { useState } from 'react'

type Hints = {
  template?: string[]
  tips?: string[]
  keywords?: string[]
}

type Props = {
  hints?: Hints
}

export default function HintsTooltip({ hints }: Props) {
  const [showHints, setShowHints] = useState(false)

  if (!hints || ((!hints.template || hints.template.length === 0) &&
                 (!hints.tips || hints.tips.length === 0) &&
                 (!hints.keywords || hints.keywords.length === 0))) {
    return null
  }

  return (
    <div className="relative inline-block">
      {/* Hints Button */}
      <button
        onClick={() => setShowHints(!showHints)}
        className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        title="回答ヒントを表示"
      >
        <span>💡</span>
        <span>ヒント</span>
      </button>

      {/* Tooltip */}
      {showHints && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-blue-200 shadow-lg z-50 p-4 space-y-3">
          {/* Template Section */}
          {hints.template && hints.template.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>📋</span> 回答テンプレート（この順で説明してください）
              </div>
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                {hints.template.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-blue-600 bg-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 font-medium">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section */}
          {hints.tips && hints.tips.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>🎯</span> 回答のポイント
              </div>
              <ul className="space-y-1">
                {hints.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords Section */}
          {hints.keywords && hints.keywords.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>🔑</span> キーワード
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hints.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => setShowHints(false)}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2 text-center w-full py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Backdrop */}
      {showHints && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowHints(false)}
        />
      )}
    </div>
  )
}
