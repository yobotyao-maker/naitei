import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildDesignEvalPrompt, buildDesignOverallFeedbackPrompt } from '@/lib/design-prompts'

const client = new Anthropic()

// POST /api/design/evaluate — 単一問題の AI 採点
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const {
      session_id,
      question_id,
      question_number,
      category,
      question_content,
      complexity,
      user_answer,
    } = await req.json()

    const prompt = buildDesignEvalPrompt({
      questionNumber: question_number,
      category,
      questionContent: question_content,
      userAnswer: user_answer,
      complexity,
    })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = message.content[0]
    if (!block || block.type !== 'text') throw new Error('Unexpected Claude response')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: Record<string, any>
    try {
      result = JSON.parse((block as { type: 'text'; text: string }).text.replace(/```json|```/g, '').trim())
    } catch {
      throw new Error('Claude returned invalid JSON')
    }

    // design_answers テーブルに保存
    const { error: ansErr } = await supabase.from('design_answers').insert({
      session_id,
      question_id,
      question_number,
      user_answer,
      ai_score: result.score,
      ai_feedback: result.feedback,
      scoring_detail: {
        accuracy: result.accuracy,
        completeness: result.completeness,
        clarity: result.clarity,
        terminology: result.terminology,
      },
    })
    if (ansErr) console.error('design_answers insert error:', ansErr)

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 })
  }
}

// PUT /api/design/evaluate — 全問完了後の総合フィードバック生成
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { selected_domains, total_score, p_level, answers_with_scores } = await req.json()

    const prompt = buildDesignOverallFeedbackPrompt({
      selectedDomains: selected_domains,
      totalScore: total_score,
      pLevel: p_level,
      answersWithScores: answers_with_scores,
    })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = message.content[0]
    if (!block || block.type !== 'text') throw new Error('Unexpected Claude response')
    const overall_feedback = (block as { type: 'text'; text: string }).text.trim()

    return NextResponse.json({ overall_feedback })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to generate overall feedback' }, { status: 500 })
  }
}
