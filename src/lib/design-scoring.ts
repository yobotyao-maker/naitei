// ─────────────────────────────────────────────────────────
// 設計コース採点ロジック
// ─────────────────────────────────────────────────────────

export const DESIGN_DOMAINS = [
  '画面設計',
  'テーブル設計',
  'バッチ設計',
  'インターフェース設計',
  'プログラム設計',
  '帳票設計',
  'データ移行設計',
  '非機能設計',
  'セキュリティ設計',
] as const

export type DesignDomain = typeof DESIGN_DOMAINS[number]

// ── 背景評価スコア（合計最大30点） ──────────────────────────

export const JAPANESE_LEVEL_SCORE: Record<string, number> = {
  B: 4,   // ビジネスレベル
  C: 8,   // 上級ビジネス〜ネイティブ同等
}

export const SOFT_SKILL_SCORE: Record<string, number> = {
  S1: 2,  // 基本コミュニケーション
  S2: 5,  // 主体的コミュニケーション・調整力あり
  S3: 8,  // リーダーシップ・メンタリング能力
}

export const BASIC_DESIGN_YEARS_SCORE: Record<string, number> = {
  '<1': 2,
  '1-3': 5,
  '3+': 8,
}

export const REQUIREMENT_YEARS_SCORE: Record<string, number> = {
  '<1': 1,
  '1+': 3,
}

export const REVIEWER_YEARS_SCORE: Record<string, number> = {
  '<1': 1,
  '1+': 3,
}

export function calcBackgroundScore(params: {
  japanese_level: string
  soft_skill_level: string
  basic_design_years: string
  requirement_years: string
  reviewer_years: string
}): number {
  return (
    (JAPANESE_LEVEL_SCORE[params.japanese_level] ?? 0) +
    (SOFT_SKILL_SCORE[params.soft_skill_level] ?? 0) +
    (BASIC_DESIGN_YEARS_SCORE[params.basic_design_years] ?? 0) +
    (REQUIREMENT_YEARS_SCORE[params.requirement_years] ?? 0) +
    (REVIEWER_YEARS_SCORE[params.reviewer_years] ?? 0)
  )
}

// ── Pレベル判定（合計80点満点） ────────────────────────────

export function calcPLevel(totalScore: number): 'P1' | 'P2' | 'P3' | 'P4' {
  if (totalScore >= 63) return 'P4'
  if (totalScore >= 46) return 'P3'
  if (totalScore >= 26) return 'P2'
  return 'P1'
}

export const P_LEVEL_LABELS: Record<string, { label: string; description: string; color: string }> = {
  P1: {
    label: 'P1 — 基礎レベル',
    description: '基本設計の基礎知識は持つが、独力での遂行にはサポートが必要',
    color: 'text-gray-500',
  },
  P2: {
    label: 'P2 — 実務レベル',
    description: '指示のもとで基本設計業務を遂行できる。一部の設計領域で自立している',
    color: 'text-blue-500',
  },
  P3: {
    label: 'P3 — 上級レベル',
    description: '複数の設計領域で自立して遂行できる。一部の設計主導が可能',
    color: 'text-green-600',
  },
  P4: {
    label: 'P4 — エキスパート',
    description: '設計フェーズ全体をリードし、メンバーの育成・レビューもできる',
    color: 'text-purple-600',
  },
}

// ── セッションで出題する問題を選択（最大10問） ────────────────

export type QuestionRow = {
  id: string
  number: number
  category: string
  content: string
  complexity: string | null
  is_required: boolean
  design_domains: string[]
}

export function selectQuestions(
  allQuestions: QuestionRow[],
  selectedDomains: string[],
  maxCount = 10,
): QuestionRow[] {
  // 必須問題：選択ドメインに含まれるもの（または全般）
  const required = allQuestions.filter(
    q =>
      q.is_required &&
      (q.design_domains.some(d => selectedDomains.includes(d)) ||
        q.design_domains.includes('全般')),
  )

  // 通常問題：選択ドメインと合致するもの（補足事項・加点減点問題は除外）
  const normal = allQuestions.filter(
    q =>
      q.complexity === '通常問題' &&
      (q.design_domains.some(d => selectedDomains.includes(d)) ||
        q.design_domains.includes('全般')),
  )

  const selected: QuestionRow[] = [...required]

  // 10問に達するまで通常問題を追加
  for (const q of normal) {
    if (selected.length >= maxCount) break
    if (!selected.find(s => s.id === q.id)) selected.push(q)
  }

  // まだ足りない場合は基本設計の範囲（'-'カテゴリ）から補填
  if (selected.length < maxCount) {
    const general = allQuestions.filter(q => q.complexity === '-' && q.category === '基本設計の範囲')
    for (const q of general) {
      if (selected.length >= maxCount) break
      if (!selected.find(s => s.id === q.id)) selected.push(q)
    }
  }

  return selected.sort((a, b) => a.number - b.number)
}
