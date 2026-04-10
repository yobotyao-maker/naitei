import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildEvalPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase-server'
import { EvaluateRequestSchema } from '@/lib/validation'
import { createApiResponse, ApiError } from '@/lib/api-errors'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const body = await req.json()

    // 验证请求
    const validatedData = EvaluateRequestSchema.parse(body)
    const { jobRole, experience, question, answer, lang, characterId, interviewerEid, intervieweeEid } = validatedData

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: buildEvalPrompt(jobRole, question, answer, lang, characterId) }]
    })

    const block = message.content[0]
    if (!block || block.type !== 'text') throw new Error('Unexpected Claude response format')
    const raw = (block as { type: 'text'; text: string }).text
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: Record<string, any>
    try {
      result = JSON.parse(raw.replace(/```json|```/g, '').trim())
    } catch {
      throw new Error('Claude returned invalid JSON')
    }

    // 换算为10分制
    if (lang === 'ja') {
      result.technicalPct = Math.round((result.technical / 30) * 10 * 10) / 10
      result.expressionPct = Math.round((result.expression / 25) * 10 * 10) / 10
      result.logicPct = Math.round((result.logic / 25) * 10 * 10) / 10
      result.japanesePct = Math.round((result.japanese / 20) * 10 * 10) / 10
    } else {
      result.technicalPct = Math.round((result.technical / 40) * 10 * 10) / 10
      result.expressionPct = Math.round((result.expression / 30) * 10 * 10) / 10
      result.logicPct = Math.round((result.logic / 30) * 10 * 10) / 10
    }
    result.lang = lang ?? 'zh'

    if (user) {
      await supabase.from('interviews').insert({
        user_id: user.id,
        job_role: jobRole,
        experience,
        question,
        answer,
        score: result.score,
        level: result.level,
        feedback: result.feedback,
        lang: lang ?? 'zh',
        technical_score: result.technical ?? null,
        expression_score: result.expression ?? null,
        logic_score: result.logic ?? null,
        japanese_score: lang === 'ja' ? (result.japanese ?? null) : null,
        eid:             intervieweeEid || null,
        interviewer_eid: interviewerEid  || null,
      })

      // 附带剩余回数，供前端显示提示
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, interviews_used, interviews_limit')
        .eq('user_id', user.id)
        .maybeSingle()
      if (sub && sub.plan !== 'pro') {
        result.remaining = Math.max(0, sub.interviews_limit - sub.interviews_used)
      }
    }

    return NextResponse.json(result)
  } catch (e) {
    const { status, body } = createApiResponse(e)

    // 获取用户信息用于日志
    let userId: string | undefined
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
    } catch {
      // 如果获取用户失败，继续记录日志
    }

    console.error(`[${requestId}] Evaluation request failed`, {
      error: e instanceof Error ? e.message : String(e),
      errorType: e instanceof Error ? e.name : typeof e,
      userId,
      status,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(body, { status })
  }
}
