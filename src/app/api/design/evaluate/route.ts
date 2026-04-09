import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildDesignEvalPrompt, buildDesignOverallFeedbackPrompt } from '@/lib/design-prompts'

const client = new Anthropic()

// POST /api/design/evaluate — 単一問題の AI 採点（ログイン不要）
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    // ログイン済み かつ ゲストセッションでない場合のみ DB に保存
    if (user && session_id && !String(session_id).startsWith('guest-')) {
      // セッションから EID を取得して回答行に付与
      const { data: sessionData } = await supabase
        .from('design_sessions')
        .select('interviewee_eid, interviewer_eid')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single()

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
        interviewee_eid: sessionData?.interviewee_eid ?? null,
        interviewer_eid: sessionData?.interviewer_eid ?? null,
      })
      if (ansErr) console.error('design_answers insert error:', ansErr)
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 })
  }
}

// PUT /api/design/evaluate — 全問完了後の総合フィードバック生成（ログイン不要）
export async function PUT(req: NextRequest) {
  try {
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
