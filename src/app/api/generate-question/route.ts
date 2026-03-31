import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildQuestionPrompt } from '@/lib/prompts'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { jobRole, experience, lang } = await req.json()
    if (!jobRole) return NextResponse.json({ error: 'jobRole is required' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: buildQuestionPrompt(jobRole, experience, lang) }]
    })

    const question = (message.content[0] as { type: string; text: string }).text
    return NextResponse.json({ question })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}
