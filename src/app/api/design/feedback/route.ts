import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, feedback_text, rating, feedback_type } = body

    if (!session_id || !feedback_text) {
      return NextResponse.json(
        { error: 'session_id and feedback_text are required' },
        { status: 400 }
      )
    }

    // Use service role key for backend operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('design_feedback')
      .insert({
        session_id,
        user_id: null, // Optional: can be null for anonymous feedback
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
