import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp      = req.nextUrl.searchParams
  const eid     = sp.get('eid')     || null
  const level   = sp.get('level')   || null
  const from    = sp.get('from')    || null
  const to      = sp.get('to')      || null
  const page    = parseInt(sp.get('page') || '0')
  const limit   = 20

  try {
    // 構築クエリ
    let query = supabase
      .from('design_sessions')
      .select(`
        id,
        user_id,
        interviewer_eid,
        interviewee_eid,
        department,
        background_score,
        technical_score,
        total_score,
        p_level,
        created_at,
        interview_date,
        design_answers (
          id,
          question_number,
          user_answer,
          ai_score,
          ai_feedback
        )
      `, { count: 'exact' })

    // フィルター適用
    if (eid) {
      query = query.or(`interviewer_eid.eq.${eid},interviewee_eid.eq.${eid}`)
    }
    if (level) {
      query = query.eq('p_level', level)
    }
    if (from) {
      query = query.gte('created_at', `${from}T00:00:00`)
    }
    if (to) {
      query = query.lte('created_at', `${to}T23:59:59`)
    }

    // ページネーション + ソート
    const { data: rows, count, error } = await query
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) throw error

    // データ変換（フロントエンド互換性のため）
    const transformedRows = rows?.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      eid: r.interviewee_eid,
      interviewer_eid: r.interviewer_eid,
      job_role: `${r.department || 'Design'} (${r.design_answers?.length || 0}問)`,
      score: r.total_score || 0,
      level: r.p_level || 'P1',
      feedback: '',
      lang: null,
      technical_score: r.technical_score,
      expression_score: null,
      logic_score: null,
      japanese_score: null,
      created_at: r.created_at,
      question: null,
      answer: null,
      experience: null,
      _design_answers: r.design_answers,
      _interview_date: r.interview_date,
    })) || []

    return NextResponse.json({
      total: count || 0,
      rows: transformedRows,
      page,
      limit,
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
