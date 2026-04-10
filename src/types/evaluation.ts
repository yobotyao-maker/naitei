/**
 * 评估结果的类型定义
 * 用于Interview和Design课程的统一结果类型
 */

/**
 * Interview课程的评估结果
 */
export interface InterviewEvaluationResult {
  score: number
  level: 'S1' | 'S2' | 'S3' | 'S4'
  feedback: string
  accuracy?: number
  completeness?: number
  clarity?: number
  terminology?: number
  technical?: number
  expression?: number
  logic?: number
  japanese?: number
  technicalPct?: number
  expressionPct?: number
  logicPct?: number
  japanesePct?: number
  lang?: 'zh' | 'ja'
  remaining?: number
}

/**
 * Design课程的评估结果
 */
export interface DesignEvaluationResult {
  score: number
  level: 'P1' | 'P2' | 'P3' | 'P4'
  feedback: string
  accuracy?: number
  completeness?: number
  clarity?: number
  terminology?: number
  questionId?: string
  questionNumber?: number
}

/**
 * 通用评估结果 (支持两个课程)
 */
export type EvaluationResult = InterviewEvaluationResult | DesignEvaluationResult

/**
 * 类型守卫：判断是否是Interview结果
 */
export function isInterviewResult(
  result: EvaluationResult
): result is InterviewEvaluationResult {
  return (result.level as string).startsWith('S')
}

/**
 * 类型守卫：判断是否是Design结果
 */
export function isDesignResult(
  result: EvaluationResult
): result is DesignEvaluationResult {
  return (result.level as string).startsWith('P')
}
