/**
 * API客户端工具
 * 提供超时控制和自动重试功能
 */

import { isRetryable } from './api-errors'

export interface FetchOptions {
  maxRetries?: number
  timeout?: number
  retryDelay?: number
}

/**
 * 带超时和重试的fetch请求
 * @param url - 请求URL
 * @param options - 请求选项
 * @param fetchOptions - 超时和重试配置
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  fetchOptions: FetchOptions = {}
): Promise<Response> {
  const {
    maxRetries = 2,
    timeout = 30000,
    retryDelay = 1000,
  } = fetchOptions

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout)
      return response
    } catch (e) {
      lastError = e as Error

      // 检查是否可重试
      if (!isRetryable(e) || attempt === maxRetries) {
        throw lastError
      }

      // 等待后重试（指数退避）
      const delay = retryDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Unknown error in fetchWithRetry')
}

/**
 * 带超时的fetch请求
 * @param url - 请求URL
 * @param options - 请求选项
 * @param timeout - 超时时间（毫秒）
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // 如果是abort错误，转换为更明确的超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`)
      timeoutError.name = 'TimeoutError'
      throw timeoutError
    }

    throw error
  }
}

/**
 * JSON请求助手
 */
export async function fetchJSON<T>(
  url: string,
  options: RequestInit = {},
  fetchOptions: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options, fetchOptions)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP ${response.status}`
    )
    ;(error as any).status = response.status
    ;(error as any).data = errorData
    throw error
  }

  return response.json()
}
