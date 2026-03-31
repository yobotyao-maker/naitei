import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildEvalPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase-server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { jobRole, question, answer, lang } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: buildEvalPrompt(jobRole, question, answer, lang) }]
    })

    const raw = (message.content[0] as { type: string; text: string }).text
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim())

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
        question,
        answer,
        score: result.score,
        level: result.level,
        feedback: result.feedback
      })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to evaluate' }, { status: 500 })
  }
}
