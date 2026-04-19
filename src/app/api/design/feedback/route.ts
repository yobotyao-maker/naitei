import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const body = await req.json()
    const { question_number, question_content, feedback_text, rating, feedback_type } = body

    if (!question_number || !feedback_text) {
      return NextResponse.json(
        { error: 'question_number and feedback_text are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('design_feedback')
      .insert({
        user_id: user.id,
        session_id: null,
        question_number,
        question_content: question_content || null,
        feedback_text: feedback_text.trim(),
        rating: rating || 5,
        feedback_type: feedback_type || 'その他',
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Failed to save feedback: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json(
      { error: `Error: ${e.message || 'Internal server error'}` },
      { status: 500 }
    )
  }
}
