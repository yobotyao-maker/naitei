import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { calcBackgroundScore, calcPLevel } from '@/lib/design-scoring'

// POST /api/design/sessions — セッション作成
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      interviewer_eid,
      department,
      japanese_level,
      soft_skill_level,
      basic_design_years,
      requirement_years,
      reviewer_years,
      selected_domains,
    } = body

    const background_score = calcBackgroundScore({
      japanese_level,
      soft_skill_level,
      basic_design_years,
      requirement_years,
      reviewer_years,
    })

    const { data, error } = await supabase
      .from('design_sessions')
      .insert({
        user_id: user.id,
        interviewer_eid,
        department,
        japanese_level,
        soft_skill_level,
        basic_design_years,
        requirement_years,
        reviewer_years,
        selected_domains,
        background_score,
        status: 'in_progress',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// PATCH /api/design/sessions — セッション完了（集計・Pレベル確定）
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, question_scores, overall_feedback } = await req.json()

    // セッション取得
    const { data: session, error: sErr } = await supabase
      .from('design_sessions')
      .select('background_score')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (sErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const technical_score = Object.values(question_scores as Record<string, number>).reduce(
      (sum, s) => sum + (s ?? 0),
      0,
    )
    const total_score = session.background_score + technical_score
    const p_level = calcPLevel(total_score)

    const { data, error } = await supabase
      .from('design_sessions')
      .update({
        question_scores,
        technical_score,
        total_score,
        p_level,
        overall_feedback,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', session_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
  }
}
