import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { calcBackgroundScore, calcPLevel, selectQuestions } from '@/lib/design-scoring'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// POST /api/design/sessions — セッション作成 + 問題リスト返却
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const body = await req.json()
    const {
      interview_date,
      interviewer_eid,
      interviewee_eid,
      department,
      japanese_level,
      soft_skill_level,
      basic_design_years,
      requirement_years,
      reviewer_years,
      selected_domains,
    } = body

    // Interviewer EID は必須
    if (!interviewer_eid || !interviewer_eid.trim()) {
      return NextResponse.json({ error: 'Interviewer EID is required' }, { status: 400 })
    }

    const background_score = calcBackgroundScore({
      japanese_level,
      soft_skill_level,
      basic_design_years,
      requirement_years,
      reviewer_years,
    })

    // 問題一覧取得（service role で RLS バイパス）
    const serviceClient = getServiceClient()
    const { data: allQuestions, error: qErr } = await serviceClient
      .from('design_questions')
      .select('*')
      .order('number')

    if (qErr) throw qErr

    const questions = selectQuestions(allQuestions ?? [], selected_domains ?? [])

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      japanese_level,
      soft_skill_level,
      basic_design_years,
      requirement_years,
      reviewer_years,
      selected_domains,
      background_score,
      status: 'in_progress',
    }

    if (interview_date)    insertData.interview_date    = interview_date
    insertData.interviewer_eid   = interviewer_eid
    if (interviewee_eid)   insertData.interviewee_eid   = interviewee_eid
    if (department)        insertData.department        = department

    const { data: session, error } = await supabase
      .from('design_sessions')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ...session, questions })
  } catch (e: any) {
    console.error('[design/sessions POST]', e)
    return NextResponse.json({ error: e?.message ?? 'Failed to create session' }, { status: 500 })
  }
}

// PATCH /api/design/sessions — セッション完了（集計・Pレベル確定）
export async function PATCH(req: NextRequest) {
  try {
    const { session_id, question_scores, overall_feedback } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

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
