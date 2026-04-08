'use client'
import type { Lang } from '@/lib/prompts'
import { CHARACTERS } from '@/components/manga/manga-design-system'
import { CharacterSVG } from '@/components/manga/CharacterSVG'

export default function QuestionCard({
  question, jobRole, lang, characterId, onReady,
}: {
  question: string; jobRole: string; lang: Lang; characterId?: string; onReady: () => void
}) {
  const char = characterId ? CHARACTERS[characterId] : undefined

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#2D5BE3]">
        <span className="text-white text-xs font-medium">{jobRole}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
          ${lang === 'ja' ? 'bg-red-400 text-white' : 'bg-emerald-400 text-white'}`}>
          {lang === 'ja' ? '日本語' : '中文'}
        </span>
      </div>

      <div className="p-5">
        {char ? (
          /* キャラクター + 吹き出し */
          <div className="flex items-end gap-3 mb-5">
            <div className="flex flex-col items-center flex-shrink-0">
              <CharacterSVG character={char} mood="strict" size="sm" />
              <span className="text-[10px] text-gray-500 mt-1 font-medium">{char.name}</span>
              <span className="text-[9px] text-[#2D5BE3] bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">
                {char.role}
              </span>
            </div>
            {/* 吹き出し */}
            <div className="flex-1 relative">
              <div className="bg-gray-50 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-3 text-sm text-gray-800 leading-relaxed">
                {question}
              </div>
            </div>
          </div>
        ) : (
          <h2 className="text-lg font-medium text-gray-900 mb-5 leading-relaxed">{question}</h2>
        )}

        <button
          onClick={onReady}
          className="w-full bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-colors"
        >
          {lang === 'ja' ? '日本語で回答する →' : '用中文回答 →'}
        </button>
      </div>
    </div>
  )
}
