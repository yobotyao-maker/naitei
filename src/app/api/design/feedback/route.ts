import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { session_id, feedback_text, rating, feedback_type } = body

    if (!session_id || !feedback_text) {
      return NextResponse.json(
        { error: 'session_id and feedback_text are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('design_feedback')
      .insert({
        session_id,
        user_id: user.id,
        feedback_text: feedback_text.trim(),
        rating: rating || 5,
        feedback_type: feedback_type || 'その他',
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json(
      { error: e.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
