// ─────────────────────────────────────────────────────────
// 設計コース採点ロジック（採点表準拠）
// ─────────────────────────────────────────────────────────

export const DESIGN_DOMAINS = [
  '画面設計',
  'セキュリティ設計',
  '帳票設計',
  'バッチ設計',
  '外部システムI/F設計',
  'API設計',
  'データベース設計',
  '要件定義',
] as const

export type DesignDomain = typeof DESIGN_DOMAINS[number]

// ── 背景評価スコア（合計最大50点） ──────────────────────────

export const JAPANESE_LEVEL_SCORE: Record<string, number> = {
  B: 0,   // ビジネスレベル（B未満は面談対象外）
  C: 10,  // 上級ビジネス〜ネイティブ同等
}

export const SOFT_SKILL_SCORE: Record<string, number> = {
  S1: 5,   // 基本コミュニケーション
  S2: 10,  // 主体的コミュニケーション・調整力あり
  S3: 15,  // リーダーシップ・メンタリング能力
}

export const BASIC_DESIGN_YEARS_SCORE: Record<string, number> = {
  '<1': 0,
  '1-3': 5,
  '3+': 10,
}

export const REQUIREMENT_YEARS_SCORE: Record<string, number> = {
  '<1': 0,
  '1+': 10,
}

export const REVIEWER_YEARS_SCORE: Record<string, number> = {
  '<1': 0,
  '1+': 5,
}

export function calcBackgroundScore(params: {
  japanese_level: string | null
  soft_skill_level: string | null
  basic_design_years: string
  requirement_years: string
  reviewer_years: string
}): number {
  const japaneseScore = params.japanese_level ? (JAPANESE_LEVEL_SCORE[params.japanese_level] ?? 0) : 0
  const softSkillScore = params.soft_skill_level ? (SOFT_SKILL_SCORE[params.soft_skill_level] ?? 0) : 0
  return (
    japaneseScore +
    softSkillScore +
    (BASIC_DESIGN_YEARS_SCORE[params.basic_design_years] ?? 0) +
    (REQUIREMENT_YEARS_SCORE[params.requirement_years] ?? 0) +
    (REVIEWER_YEARS_SCORE[params.reviewer_years] ?? 0)
  )
}

// ── Pレベル判定（合計100点満点） ───────────────────────────

export function calcPLevel(totalScore: number): 'P1' | 'P2' | 'P3' | 'P4' {
  if (totalScore >= 90) return 'P4'
  if (totalScore >= 80) return 'P3'
  if (totalScore >= 60) return 'P2'
  return 'P1'
}

export const P_LEVEL_LABELS: Record<string, { label: string; description: string; color: string }> = {
  P1: {
    label: 'P1 — 設計初心者',
    description: 'SVの指導によりSimple設計を担当可。トレーニング&P1試験が必要。',
    color: 'text-gray-500',
  },
  P2: {
    label: 'P2 — 設計中級者',
    description: 'Medium機能を担当可。Backend/Front設計経験あり。(ML9/ML10)',
    color: 'text-blue-500',
  },
  P3: {
    label: 'P3 — 設計高級者',
    description: 'Complex機能を担当可。Front+Backend設計経験あり。Review担当可。(ML8/ML9)',
    color: 'text-green-600',
  },
  P4: {
    label: 'P4 — 要件担当',
    description: 'システム要件定義に参画可。業務ロジックを理解し最善な要件方針を提案。(ML7/ML8)',
    color: 'text-purple-600',
  },
}

// ── セッションで出題する問題を選択（10問固定） ────────────────

export type QuestionRow = {
  id: string
  number: number
  category: string
  content: string
  complexity: string | null
  is_required: boolean
  display_order: string | null
  design_domains: string[]
  hints?: {
    template?: string[]
    tips?: string[]
    keywords?: string[]
  }
}

export function selectQuestions(
  allQuestions: QuestionRow[],
  selectedDomains: string[],
): QuestionRow[] {
  const get = (n: number) => allQuestions.find(q => q.number === n)

  const selected: QuestionRow[] = []

  // Q1-Q3: 基本設計の範囲（進め、常に出題）
  ;[1, 2, 3].forEach(n => { const q = get(n); if (q) selected.push(q) })

  // Q7-Q10: 必須問題（常に出題）
  ;[7, 8, 9, 10].forEach(n => { const q = get(n); if (q) selected.push(q) })

  // Q11: 基本設計のプロセス（任意2-3から1問）
  const q11 = get(11)
  if (q11) selected.push(q11)

  // Q28: 補足事項（必須）
  const q28 = get(28)
  if (q28) selected.push(q28)

  // 残り2スロットを通常問題で埋める（選択ドメイン関連 or 番号順）
  const normal = allQuestions.filter(
    q =>
      q.complexity === '通常問題' &&
      !selected.find(s => s.id === q.id) &&
      q.number !== 11,
  )

  // 選択ドメインに関連する問題を優先
  const domainRelated = normal.filter(q =>
    q.design_domains.some(d => selectedDomains.includes(d)),
  )
  const others = normal.filter(q => !domainRelated.find(d => d.id === q.id))

  for (const q of [...domainRelated, ...others]) {
    if (selected.length >= 10) break
    selected.push(q)
  }

  return selected.sort((a, b) => a.number - b.number)
}
