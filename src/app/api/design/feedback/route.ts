import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

    // Validate session_id is a valid UUID
    if (!UUID_REGEX.test(session_id)) {
      return NextResponse.json(
        { error: `Invalid session_id format. Got: ${session_id}` },
        { status: 400 }
      )
    }

    // Use service role key for backend operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if session exists
    const { data: sessionExists, error: checkError } = await supabase
      .from('design_sessions')
      .select('id')
      .eq('id', session_id)
      .single()

    if (checkError || !sessionExists) {
      console.error('Session not found:', session_id)
      return NextResponse.json(
        { error: `Design session not found: ${session_id}` },
        { status: 404 }
      )
    }

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
