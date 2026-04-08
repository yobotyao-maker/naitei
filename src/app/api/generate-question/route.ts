import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildQuestionPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase-server'
import { checkAndConsumeSession } from '@/lib/quota'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { jobRole, experience, lang, isFirst, characterId } = await req.json()
    if (!jobRole) return NextResponse.json({ error: 'jobRole is required' }, { status: 400 })

    // 仅在 session 第一题时检查并扣减额度
    if (isFirst) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const quota = await checkAndConsumeSession(supabase, user?.id)
      if (!quota.allowed) {
        return NextResponse.json(
          { error: 'quota_exceeded', used: quota.used, limit: quota.limit, plan: quota.plan },
          { status: 402 }
        )
      }
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: buildQuestionPrompt(jobRole, experience, lang, characterId) }]
    })

    const block = message.content[0]
    if (!block || block.type !== 'text') throw new Error('Unexpected Claude response format')
    const question = (block as { type: 'text'; text: string }).text
    return NextResponse.json({ question })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}
