/**
 * Interview (標準面接) 定数
 */
export const INTERVIEW = {
  MAX_QUESTIONS: 30,
  MIN_ANSWER_LENGTH: 20,
  MAX_ANSWER_LENGTH: 500,
  ANSWER_WARNING_THRESHOLD: 100, // 残り100字で警告表示
}

/**
 * UI/UXの遅延定数（ミリ秒）
 */
export const UI_DELAYS = {
  TEXT_FOCUS_DELAY: 100, // テキストボックスのfocus遅延
  LOADING_TIMEOUT: 30000, // API要求のタイムアウト
  RETRY_DELAY: 1000, // リトライの初期遅延
}

/**
 * API定数
 */
export const API = {
  MAX_RETRIES: 2,
  TIMEOUT_MS: 30000,
  RETRY_DELAY_MS: 1000,
}

export const MAX_QUESTIONS = INTERVIEW.MAX_QUESTIONS

export const levelColor: Record<string, string> = {
  P1: 'text-red-500',
  P2: 'text-orange-400',
  P3: 'text-blue-500',
  P4: 'text-green-500',
}

export const levelBg: Record<string, string> = {
  P1: 'bg-red-50',
  P2: 'bg-orange-50',
  P3: 'bg-blue-50',
  P4: 'bg-green-50',
}

export const levelLabel: Record<string, string> = {
  P1: '設計初心者',
  P2: '設計中級者',
  P3: '設計高級者',
  P4: '要件担当',
}
