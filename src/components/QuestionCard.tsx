import type { Lang } from '@/lib/prompts'

export default function QuestionCard({ question, jobRole, lang, onReady }: { question: string; jobRole: string; lang: Lang; onReady: () => void }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
          {jobRole}
        </div>
        <div className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium
          ${lang === 'ja' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
          {lang === 'ja' ? '🇯🇵 日本語' : '🇨🇳 中文'}
        </div>
      </div>
      <h2 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">{question}</h2>
      <button
        onClick={onReady}
        className="w-full bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-colors"
      >
        {lang === 'ja' ? '日本語で回答する →' : '用中文回答 →'}
      </button>
    </div>
  )
}
