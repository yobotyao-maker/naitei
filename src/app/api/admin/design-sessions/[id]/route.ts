import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  // セッション基本情報
  const { data: session, error: sErr } = await supabase
    .rpc('get_admin_design_sessions', { p_limit: 200, p_offset: 0 })

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 })

  const rows: any[] = session?.rows ?? []
  const found = rows.find((r: any) => r.id === id)
  if (!found) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // 回答明細（design_answersをservice roleで取得）
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: answers } = await service
    .from('design_answers')
    .select('question_number, user_answer, ai_score, ai_feedback, scoring_detail, question_id')
    .eq('session_id', id)
    .order('question_number')

  const { data: questions } = await service
    .from('design_questions')
    .select('id, number, category, content, complexity')
    .order('number')

  const qMap = Object.fromEntries((questions ?? []).map((q: any) => [q.id, q]))

  const answersWithQuestion = (answers ?? []).map((a: any) => ({
    ...a,
    question: qMap[a.question_id] ?? null,
  }))

  return NextResponse.json({ session: found, answers: answersWithQuestion })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { status, p_level, interviewee_eid, department } = body

  try {
    const { data, error } = await supabase
      .from('design_sessions')
      .update({
        ...(status !== undefined && { status }),
        ...(p_level !== undefined && { p_level }),
        ...(interviewee_eid !== undefined && { interviewee_eid }),
        ...(department !== undefined && { department }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    console.error('[PATCH Error]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
