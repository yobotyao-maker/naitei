'use client'

export type BackgroundData = {
  interviewer_eid: string
  department: string
  japanese_level: string
  soft_skill_level: string
  basic_design_years: string
  requirement_years: string
  reviewer_years: string
}

type Props = {
  onSubmit: (data: BackgroundData) => void
}

const JAPANESE_LEVELS = [
  { value: 'B', label: 'B — ビジネスレベル（JLPT N2相当）' },
  { value: 'C', label: 'C — 上級ビジネス（JLPT N1・ネイティブ同等）' },
]

const SOFT_SKILL_LEVELS = [
  { value: 'S1', label: 'S1 — 基本的な業務コミュニケーション' },
  { value: 'S2', label: 'S2 — 主体的な調整・関係者折衝が可能' },
  { value: 'S3', label: 'S3 — リーダーシップ・メンタリング能力あり' },
]

const DESIGN_YEARS = [
  { value: '<1', label: '1年未満' },
  { value: '1-3', label: '1〜3年' },
  { value: '3+', label: '3年以上' },
]

const BINARY_YEARS = [
  { value: '<1', label: '1年未満' },
  { value: '1+', label: '1年以上' },
]

export default function BackgroundForm({ onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit({
      interviewer_eid: fd.get('interviewer_eid') as string,
      department: fd.get('department') as string,
      japanese_level: fd.get('japanese_level') as string,
      soft_skill_level: fd.get('soft_skill_level') as string,
      basic_design_years: fd.get('basic_design_years') as string,
      requirement_years: fd.get('requirement_years') as string,
      reviewer_years: fd.get('reviewer_years') as string,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">背景評価</h2>
        <p className="text-sm text-gray-400">あなたの経験レベルを選択してください（採点の参考情報です）</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          面接官EID <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="interviewer_eid"
          required
          placeholder="例: EID12345"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          部署 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="department"
          required
          placeholder="例: システム開発部"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <Field label="日本語レベル" name="japanese_level" options={JAPANESE_LEVELS} />
      <Field label="ソフトスキルレベル" name="soft_skill_level" options={SOFT_SKILL_LEVELS} />
      <Field label="基本設計経験年数" name="basic_design_years" options={DESIGN_YEARS} />
      <Field label="要件定義経験年数" name="requirement_years" options={BINARY_YEARS} />
      <Field label="設計レビュー経験年数" name="reviewer_years" options={BINARY_YEARS} />

      <button
        type="submit"
        className="w-full bg-[#2D5BE3] hover:bg-blue-700 active:scale-95 text-white font-medium py-3.5 rounded-2xl transition-all"
      >
        次へ — 設計領域を選択
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={opt.value}
              required
              className="w-4 h-4 accent-[#2D5BE3]"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
