/**
 * 多语言错误消息
 * 根据用户语言设置返回对应的错误提示
 */

import type { Lang } from './prompts'

type ErrorCode =
  | 'CLAUDE_TIMEOUT'
  | 'CLAUDE_RATE_LIMIT'
  | 'CLAUDE_ERROR'
  | 'INVALID_REQUEST'
  | 'INVALID_RESPONSE_FORMAT'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'DB_ERROR'
  | 'UNKNOWN_ERROR'
  | 'VALIDATION_ERROR'

interface ErrorMessage {
  title: string
  message: string
  retryable: boolean
  action?: string
}

const messages: Record<Lang, Record<ErrorCode, ErrorMessage>> = {
  zh: {
    CLAUDE_TIMEOUT: {
      title: '生成超时',
      message: '生成题目耗时过长，请稍后重试',
      retryable: true,
      action: '重试',
    },
    CLAUDE_RATE_LIMIT: {
      title: '请求过于频繁',
      message: '系统处理速度已达上限，请稍候片刻后重试',
      retryable: true,
      action: '重试',
    },
    CLAUDE_ERROR: {
      title: '系统错误',
      message: 'AI系统暂时出错，请稍后重试',
      retryable: true,
      action: '重试',
    },
    INVALID_REQUEST: {
      title: '输入有误',
      message: '请检查输入内容是否正确',
      retryable: false,
    },
    INVALID_RESPONSE_FORMAT: {
      title: '响应格式错误',
      message: '系统返回的数据格式异常，请重试',
      retryable: true,
      action: '重试',
    },
    QUOTA_EXCEEDED: {
      title: '次数已用完',
      message: '您的面试次数已达上限，请升级套餐继续使用',
      retryable: false,
      action: '升级套餐',
    },
    NETWORK_ERROR: {
      title: '网络连接失败',
      message: '请检查网络连接，然后重试',
      retryable: true,
      action: '重试',
    },
    DB_ERROR: {
      title: '数据保存失败',
      message: '无法保存结果，请重试或联系客服',
      retryable: false,
    },
    UNKNOWN_ERROR: {
      title: '未知错误',
      message: '出现未知错误，请重试或联系客服',
      retryable: true,
      action: '重试',
    },
    VALIDATION_ERROR: {
      title: '输入验证失败',
      message: '请检查输入内容',
      retryable: false,
    },
  },
  ja: {
    CLAUDE_TIMEOUT: {
      title: '生成がタイムアウトしました',
      message: '質問生成に時間がかかっています。もう一度お試しください',
      retryable: true,
      action: '再試行',
    },
    CLAUDE_RATE_LIMIT: {
      title: 'リクエストが多すぎます',
      message: 'システムが処理できる上限に達しました。しばらく待ってからお試しください',
      retryable: true,
      action: '再試行',
    },
    CLAUDE_ERROR: {
      title: 'システムエラー',
      message: 'AIシステムで一時的なエラーが発生しました。もう一度お試しください',
      retryable: true,
      action: '再試行',
    },
    INVALID_REQUEST: {
      title: '入力が無効です',
      message: '入力内容が正しいか確認してください',
      retryable: false,
    },
    INVALID_RESPONSE_FORMAT: {
      title: 'レスポンスフォーマットエラー',
      message: 'システムから返されたデータが異常です。もう一度お試しください',
      retryable: true,
      action: '再試行',
    },
    QUOTA_EXCEEDED: {
      title: '面接回数が上限に達しました',
      message: '面接の実施回数が上限に達しました。プランをアップグレードしてください',
      retryable: false,
      action: 'アップグレード',
    },
    NETWORK_ERROR: {
      title: 'ネットワーク接続エラー',
      message: 'ネットワーク接続を確認してからもう一度お試しください',
      retryable: true,
      action: '再試行',
    },
    DB_ERROR: {
      title: 'データ保存エラー',
      message: '結果を保存できません。もう一度お試しいただくか、サポートにお問い合わせください',
      retryable: false,
    },
    UNKNOWN_ERROR: {
      title: '不明なエラー',
      message: '予期しないエラーが発生しました。もう一度お試しいただくか、サポートにお問い合わせください',
      retryable: true,
      action: '再試行',
    },
    VALIDATION_ERROR: {
      title: '入力検証エラー',
      message: '入力内容を確認してください',
      retryable: false,
    },
  },
}

/**
 * 获取错误消息
 */
export function getErrorMessage(
  code: ErrorCode = 'UNKNOWN_ERROR',
  lang: Lang = 'zh'
): ErrorMessage {
  return messages[lang]?.[code] || messages[lang].UNKNOWN_ERROR
}

/**
 * 获取错误是否可重试
 */
export function isErrorRetryable(code: ErrorCode): boolean {
  return messages.zh[code]?.retryable ?? false
}
