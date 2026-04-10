/**
 * 统一的API错误处理
 * 定义所有API错误的类型、HTTP状态码和重试策略
 */

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * 常见的API错误类型
 */
export const API_ERRORS = {
  // Claude API 相关
  CLAUDE_TIMEOUT: new ApiError(
    'CLAUDE_TIMEOUT',
    'Claude API request timed out',
    504,
    true
  ),
  CLAUDE_RATE_LIMIT: new ApiError(
    'CLAUDE_RATE_LIMIT',
    'Claude API rate limit exceeded',
    429,
    true
  ),
  CLAUDE_ERROR: new ApiError(
    'CLAUDE_ERROR',
    'Claude API returned an error',
    502,
    true
  ),

  // 数据验证相关
  INVALID_REQUEST: new ApiError(
    'INVALID_REQUEST',
    'Invalid request parameters',
    400,
    false
  ),
  INVALID_RESPONSE_FORMAT: new ApiError(
    'INVALID_RESPONSE_FORMAT',
    'Received invalid response format from Claude',
    422,
    true
  ),

  // 配额相关
  QUOTA_EXCEEDED: new ApiError(
    'QUOTA_EXCEEDED',
    'Interview quota exceeded, please upgrade',
    402,
    false
  ),

  // 网络相关
  NETWORK_ERROR: new ApiError(
    'NETWORK_ERROR',
    'Network connection failed',
    503,
    true
  ),

  // 数据库相关
  DB_ERROR: new ApiError(
    'DB_ERROR',
    'Database operation failed',
    500,
    false
  ),

  // 通用错误
  UNKNOWN_ERROR: new ApiError(
    'UNKNOWN_ERROR',
    'An unexpected error occurred',
    500,
    false
  ),
}

/**
 * 从错误对象生成API响应
 */
export function createApiResponse(error: unknown, defaultStatus = 500) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        error: error.code,
        message: error.message,
        retryable: error.retryable,
      },
    }
  }

  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: {
        error: 'VALIDATION_ERROR',
        message: error.message,
        field: error.field,
        retryable: false,
      },
    }
  }

  // 未知错误
  console.error('[API Error] Unexpected error type:', error)
  return {
    status: defaultStatus,
    body: {
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      retryable: false,
    },
  }
}

/**
 * 判断错误是否可重试
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable
  }
  if (error instanceof Error) {
    // 网络错误（断网、超时等）可重试
    return (
      error.name === 'AbortError' ||
      error.message.includes('timeout') ||
      error.message.includes('network')
    )
  }
  return false
}
