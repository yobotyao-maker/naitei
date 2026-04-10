import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// POST /api/design/feedback — フィードバック送信
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, feedback_text, rating, feedback_type } = await req.json()

    // バリデーション
    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })

    // セッション所有者確認
    const { data: session } = await supabase
      .from('design_sessions')
      .select('id')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    // フィードバック保存
    const { data, error } = await supabase
      .from('design_feedback')
      .insert({
        session_id,
        user_id: user.id,
        feedback_text: feedback_text || null,
        rating,
        feedback_type,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}

// GET /api/design/feedback — フィードバック取得（セッション単位）
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sessionId = req.nextUrl.searchParams.get('session_id')
    if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('design_feedback')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return NextResponse.json(data || null)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}
