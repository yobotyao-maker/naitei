/**
 * 表单和API请求的Zod验证schema
 */

import { z } from 'zod'

/**
 * Interview表单验证
 */
export const InterviewFormSchema = z.object({
  jobRole: z
    .string()
    .min(1, 'Job role is required')
    .max(100, 'Job role must be less than 100 characters'),
  experience: z.string().optional().default(''),
  lang: z.enum(['zh', 'ja']),
  intervieweeEid: z
    .string()
    .min(1, 'Interviewee EID is required')
    .min(4, 'EID must be at least 4 characters')
    .max(50, 'EID must be less than 50 characters'),
})

export type InterviewFormInput = z.infer<typeof InterviewFormSchema>

/**
 * Interview评分API请求验证
 */
export const EvaluateRequestSchema = z.object({
  jobRole: z.string().min(1).max(100),
  experience: z.string().optional(),
  question: z.string().min(1).max(1000),
  answer: z.string().max(3000),
  lang: z.enum(['zh', 'ja']),
  characterId: z.string().optional(),
  intervieweeEid: z.string().optional(),
  interviewerEid: z.string().optional(),
})

export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>

/**
 * Question生成API请求验证
 */
export const GenerateQuestionRequestSchema = z.object({
  jobRole: z.string().min(1).max(100),
  experience: z.string().optional(),
  lang: z.enum(['zh', 'ja']),
  isFirst: z.boolean().optional(),
  characterId: z.string().optional(),
})

export type GenerateQuestionRequest = z.infer<
  typeof GenerateQuestionRequestSchema
>

/**
 * 验证错误消息映射
 */
export const validationMessages: Record<string, string> = {
  'Job role is required': 'Please select or enter a job role',
  'Job role must be less than 100 characters':
    'Job role is too long (max 100 characters)',
  'Interviewee EID is required': 'Please enter your EID',
  'EID must be at least 4 characters': 'EID must be at least 4 characters',
  'EID must be less than 50 characters': 'EID is too long (max 50 characters)',
}

/**
 * 从Zod验证错误获取用户友好的消息
 */
export function getValidationErrorMessage(error: z.ZodError): string {
  const firstError = error.errors[0]
  if (!firstError) return 'Validation failed'

  const path = firstError.path.join('.')
  const message = firstError.message

  return validationMessages[message] || message
}
